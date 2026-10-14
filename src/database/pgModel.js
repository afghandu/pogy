const { randomUUID } = require("crypto");
const { Pool } = require("pg");
const logger = require("../utils/logger");

const models = new Map();
let pool;
let expiryCleanup;

function Schema(definition = {}, options = {}) {
  if (!(this instanceof Schema)) return new Schema(definition, options);
  this.definition = definition;
  this.options = options;
}

function requiredPathsFor(definition, parent = "") {
  const paths = [];
  for (const [key, descriptor] of Object.entries(definition || {})) {
    const path = parent ? `${parent}.${key}` : key;
    if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor) &&
      Object.prototype.hasOwnProperty.call(descriptor, "type")
    ) {
      if (descriptor.required === true) paths.push(path);
    } else if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor)
    ) {
      paths.push(...requiredPathsFor(descriptor, path));
    }
  }
  return paths;
}

function ttlPathsFor(definition, parent = "") {
  const paths = [];
  for (const [key, descriptor] of Object.entries(definition || {})) {
    const path = parent ? `${parent}.${key}` : key;
    if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor) &&
      Object.prototype.hasOwnProperty.call(descriptor, "type")
    ) {
      if (descriptor.expires !== undefined) paths.push(path);
    } else if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor)
    ) {
      paths.push(...ttlPathsFor(descriptor, path));
    }
  }
  return paths;
}

const SchemaTypes = {
  Array,
  Boolean,
  Date,
  Number,
  Object,
  String,
};

function normalizeModelName(name) {
  const normalized = name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) throw new TypeError("A PostgreSQL model name is required.");
  return `pogy_${normalized}`;
}

function getPool() {
  if (!pool) {
    throw new Error("PostgreSQL is not initialized. Call init() before querying.");
  }
  return pool;
}

function clone(value) {
  if (value === undefined || value === null || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) return new Date(value.getTime());
  if (Array.isArray(value)) return value.map(clone);
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, clone(entry)])
  );
}

function defaultsFor(definition) {
  const defaults = {};
  for (const [key, descriptor] of Object.entries(definition || {})) {
    if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor) &&
      Object.prototype.hasOwnProperty.call(descriptor, "type")
    ) {
      if (Object.prototype.hasOwnProperty.call(descriptor, "default")) {
        const value = descriptor.default;
        defaults[key] =
          typeof value === "function" ? value() : clone(value);
      }
    } else if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor)
    ) {
      const nestedDefaults = defaultsFor(descriptor);
      if (Object.keys(nestedDefaults).length) defaults[key] = nestedDefaults;
    }
  }
  return defaults;
}

function uniquePathsFor(definition, parent = "") {
  const paths = [];
  for (const [key, descriptor] of Object.entries(definition || {})) {
    const path = parent ? `${parent}.${key}` : key;
    if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor) &&
      Object.prototype.hasOwnProperty.call(descriptor, "type")
    ) {
      if (descriptor.unique === true) paths.push(path);
    } else if (
      descriptor &&
      typeof descriptor === "object" &&
      !Array.isArray(descriptor)
    ) {
      paths.push(...uniquePathsFor(descriptor, path));
    }
  }
  return paths;
}

function schemaDefinition(schema) {
  if (schema instanceof Schema) return schema;
  if (schema && schema.schemaDefinition instanceof Schema) {
    return schema.schemaDefinition;
  }
  if (schema && schema.schema instanceof Schema) return schema.schema;
  if (schema && schema._schema instanceof Schema) return schema._schema;
  if (schema && schema._schemaDefinition) {
    return new Schema(schema._schemaDefinition);
  }
  throw new TypeError("A PostgreSQL model requires a schema definition.");
}

function setPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    if (!cursor[part] || typeof cursor[part] !== "object") {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = clone(value);
}

function unsetPath(target, path) {
  const parts = path.split(".");
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    cursor = cursor && cursor[part];
    if (!cursor || typeof cursor !== "object") return;
  }
  if (cursor) delete cursor[parts[parts.length - 1]];
}

function getPath(target, path) {
  return path.split(".").reduce((value, part) => {
    if (value === null || value === undefined) return undefined;
    return value[part];
  }, target);
}

function matchesCondition(actual, condition) {
  if (
    condition &&
    typeof condition === "object" &&
    !Array.isArray(condition) &&
    !(condition instanceof Date)
  ) {
    for (const [operator, expected] of Object.entries(condition)) {
      if (!operator.startsWith("$")) {
        if (!matchesCondition(getPath(actual, operator), expected)) return false;
        continue;
      }
      switch (operator) {
        case "$eq":
          if (!matchesCondition(actual, expected)) return false;
          break;
        case "$ne":
          if (matchesCondition(actual, expected)) return false;
          break;
        case "$in":
          if (!expected.some((value) => matchesCondition(actual, value))) {
            return false;
          }
          break;
        case "$nin":
          if (expected.some((value) => matchesCondition(actual, value))) {
            return false;
          }
          break;
        case "$gt":
          if (!(actual > expected)) return false;
          break;
        case "$gte":
          if (!(actual >= expected)) return false;
          break;
        case "$lt":
          if (!(actual < expected)) return false;
          break;
        case "$lte":
          if (!(actual <= expected)) return false;
          break;
        case "$exists":
          if ((actual !== undefined) !== expected) return false;
          break;
        case "$regex": {
          const regex = new RegExp(
            expected,
            condition.$options && condition.$options.includes("i") ? "i" : ""
          );
          if (!regex.test(String(actual ?? ""))) return false;
          break;
        }
        case "$options":
          break;
        case "$elemMatch":
          if (
            !Array.isArray(actual) ||
            !actual.some((entry) => matchesFilter(entry, expected))
          ) {
            return false;
          }
          break;
        default:
          throw new Error(`Unsupported PostgreSQL query operator: ${operator}`);
      }
    }
    return true;
  }

  if (Array.isArray(actual) && !Array.isArray(condition)) {
    return actual.some((value) => matchesCondition(value, condition));
  }
  return JSON.stringify(actual) === JSON.stringify(condition);
}

function matchesFilter(document, filter = {}) {
  for (const [key, condition] of Object.entries(filter || {})) {
    if (key === "$or") {
      if (!condition.some((entry) => matchesFilter(document, entry))) return false;
    } else if (key === "$and") {
      if (!condition.every((entry) => matchesFilter(document, entry))) return false;
    } else if (key === "$nor") {
      if (condition.some((entry) => matchesFilter(document, entry))) return false;
    } else if (!matchesCondition(getPath(document, key), condition)) {
      return false;
    }
  }
  return true;
}

function applyUpdate(document, update, inserting = false) {
  const operators = Object.keys(update || {}).filter((key) =>
    key.startsWith("$")
  );
  if (!operators.length) {
    for (const [key, value] of Object.entries(update || {})) {
      setPath(document, key, value);
    }
    return document;
  }

  for (const [operator, fields] of Object.entries(update)) {
    if (operator === "$set" || (operator === "$setOnInsert" && inserting)) {
      for (const [path, value] of Object.entries(fields)) setPath(document, path, value);
    } else if (operator === "$unset") {
      for (const path of Object.keys(fields)) unsetPath(document, path);
    } else if (operator === "$inc") {
      for (const [path, amount] of Object.entries(fields)) {
        setPath(document, path, (Number(getPath(document, path)) || 0) + amount);
      }
    } else if (operator === "$push" || operator === "$addToSet") {
      for (const [path, value] of Object.entries(fields)) {
        const array = getPath(document, path) || [];
        const values =
          value && typeof value === "object" && Array.isArray(value.$each)
            ? value.$each
            : [value];
        for (const entry of values) {
          if (operator === "$push" || !array.some((item) => JSON.stringify(item) === JSON.stringify(entry))) {
            array.push(clone(entry));
          }
        }
        setPath(document, path, array);
      }
    } else if (operator === "$pull") {
      for (const [path, condition] of Object.entries(fields)) {
        const array = getPath(document, path);
        if (Array.isArray(array)) {
          setPath(
            document,
            path,
            array.filter((entry) =>
              condition && typeof condition === "object"
                ? !matchesCondition(entry, condition)
                : JSON.stringify(entry) !== JSON.stringify(condition)
            )
          );
        }
      }
    } else if (operator !== "$setOnInsert") {
      throw new Error(`Unsupported PostgreSQL update operator: ${operator}`);
    }
  }
  return document;
}

function withCallback(promise, callback) {
  if (typeof callback !== "function") return promise;
  return promise.then(
    async (value) => {
      await callback(null, value);
      return value;
    },
    async (error) => {
      await callback(error, null);
      throw error;
    }
  );
}

function buildWhere(filter = {}) {
  const values = [];
  const bind = (value, cast = "") => {
    values.push(value);
    return `$${values.length}${cast}`;
  };
  const pathExpression = (path) =>
    `document #> ${bind(path.split("."), "::text[]")}`;

  function conditionSql(path, condition) {
    const column = pathExpression(path);
    if (
      condition &&
      typeof condition === "object" &&
      !Array.isArray(condition) &&
      !(condition instanceof Date)
    ) {
      const parts = [];
      for (const [operator, expected] of Object.entries(condition)) {
        if (!operator.startsWith("$")) {
          parts.push(conditionSql(`${path}.${operator}`, expected));
        } else if (operator === "$eq") {
          parts.push(conditionSql(path, expected));
        } else if (operator === "$ne") {
          parts.push(`NOT (${conditionSql(path, expected)})`);
        } else if (operator === "$in" || operator === "$nin") {
          if (!Array.isArray(expected)) {
            throw new TypeError(`${operator} requires an array.`);
          }
          const alternatives = expected.map((entry) => conditionSql(path, entry));
          const clause = alternatives.length ? alternatives.join(" OR ") : "FALSE";
          parts.push(operator === "$nin" ? `NOT (${clause})` : `(${clause})`);
        } else if (["$gt", "$gte", "$lt", "$lte"].includes(operator)) {
          const comparator = { $gt: ">", $gte: ">=", $lt: "<", $lte: "<=" }[operator];
          const parameter = bind(
            typeof expected === "number" ? expected : String(expected),
            typeof expected === "number" ? "::numeric" : "::text"
          );
          if (typeof expected === "number") {
            parts.push(
              `(jsonb_typeof(${column}) = 'number' AND (${column} #>> '{}')::numeric ${comparator} ${parameter})`
            );
          } else {
            parts.push(`(${column} #>> '{}' ${comparator} ${parameter})`);
          }
        } else if (operator === "$exists") {
          parts.push(
            expected ? `${column} IS NOT NULL` : `${column} IS NULL`
          );
        } else if (operator === "$regex") {
          const options = condition.$options || "";
          if (/[^imsx]/.test(options)) {
            throw new Error(`Unsupported PostgreSQL regex option: ${options}`);
          }
          const expression = options.includes("i") ? "~*" : "~";
          parts.push(
            `(${column} #>> '{}' ${expression} ${bind(String(expected), "::text")})`
          );
        } else if (operator === "$options") {
          continue;
        } else if (operator === "$elemMatch") {
          const parameter = bind(JSON.stringify(expected), "::jsonb");
          parts.push(
            `(jsonb_typeof(${column}) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(${column}) AS element WHERE element @> ${parameter}))`
          );
        } else {
          throw new Error(`Unsupported PostgreSQL query operator: ${operator}`);
        }
      }
      return parts.length ? `(${parts.join(" AND ")})` : "TRUE";
    }

    if (condition === null) {
      return `(${column} IS NULL OR ${column} = 'null'::jsonb)`;
    }
    const parameter = bind(JSON.stringify(condition), "::jsonb");
    return `(${column} = ${parameter} OR (jsonb_typeof(${column}) = 'array' AND ${column} @> jsonb_build_array(${parameter})))`;
  }

  function filterSql(input) {
    const parts = [];
    for (const [key, condition] of Object.entries(input || {})) {
      if (key === "$or" || key === "$and" || key === "$nor") {
        if (!Array.isArray(condition)) {
          throw new TypeError(`${key} requires an array.`);
        }
        const children = condition.map(filterSql);
        const joiner = key === "$and" ? " AND " : " OR ";
        const joined = children.length ? children.join(joiner) : "FALSE";
        parts.push(key === "$nor" ? `NOT (${joined})` : `(${joined})`);
      } else if (key.startsWith("$")) {
        throw new Error(`Unsupported PostgreSQL query operator: ${key}`);
      } else {
        parts.push(conditionSql(key, condition));
      }
    }
    return parts.length ? parts.join(" AND ") : "TRUE";
  }

  return { sql: filterSql(filter), values };
}

class Query {
  constructor(Model, kind, filter = {}, update, options = {}) {
    this.Model = Model;
    this.kind = kind;
    this.filter = filter || {};
    this.update = update;
    this.options = options || {};
    this.sortOrder = [];
  }

  sort(order) {
    if (Array.isArray(order)) {
      this.sortOrder = order;
    } else {
      this.sortOrder = Object.entries(order || {});
    }
    return this;
  }

  exec(callback) {
    return withCallback(this.execute(), callback);
  }

  async execute() {
    try {
      return await this.run();
    } catch (error) {
      logger.error(
        `PostgreSQL ${this.kind} failed for ${this.Model.modelName}: ${error.message}`,
        { label: "Database" }
      );
      throw error;
    }
  }

  async run() {
    const client = getPool();
    const table = `"${this.Model.tableName}"`;
    const { sql, values } = buildWhere(this.filter);

    if (this.kind === "find" || this.kind === "findOne") {
      const sortSql = this.sortOrder
        .map(([field, direction]) => {
          values.push(field.split("."));
          const path = `$${values.length}::text[]`;
          const order = String(direction).toLowerCase().startsWith("desc")
            ? "DESC"
            : "ASC";
          return `document #>> ${path} ${order}`;
        })
        .join(", ");
      const limit = this.kind === "findOne" ? " LIMIT 1" : "";
      const result = await client.query(
        `SELECT document FROM ${table} WHERE ${sql}${
          sortSql ? ` ORDER BY ${sortSql}` : ""
        }${limit}`,
        values
      );
      const documents = result.rows.map((row) => new this.Model(row.document, false));
      return this.kind === "findOne" ? documents[0] || null : documents;
    }

    if (this.kind === "deleteOne" || this.kind === "deleteMany") {
      const limit = this.kind === "deleteOne" ? " LIMIT 1" : "";
      const result = await client.query(
        `DELETE FROM ${table} WHERE id IN (SELECT id FROM ${table} WHERE ${sql}${limit})`,
        values
      );
      return {
        acknowledged: true,
        deletedCount: result.rowCount,
      };
    }

    if (this.kind === "findOneAndDelete") {
      const result = await client.query(
        `DELETE FROM ${table} WHERE id = (SELECT id FROM ${table} WHERE ${sql} LIMIT 1) RETURNING document`,
        values
      );
      return result.rows[0]
        ? new this.Model(result.rows[0].document, false)
        : null;
    }

    if (this.kind === "findOneAndUpdate" || this.kind === "updateOne") {
      const connection = await client.connect();
      try {
        await connection.query("BEGIN");
        const found = await connection.query(
          `SELECT id, document FROM ${table} WHERE ${sql} LIMIT 1 FOR UPDATE`,
          values
        );
        if (!found.rows.length) {
          if (!this.options.upsert) {
            await connection.query("COMMIT");
            return this.kind === "findOneAndUpdate"
              ? null
              : {
                  acknowledged: true,
                  matchedCount: 0,
                  modifiedCount: 0,
                  upsertedCount: 0,
                  upsertedId: null,
                };
          }
          const seed = {};
          for (const [key, value] of Object.entries(this.filter)) {
            if (!key.startsWith("$") && !(value && value.$exists !== undefined)) {
              setPath(seed, key, value);
            }
          }
          const document = applyUpdate(
            this.Model.createDocument(seed),
            this.update,
            true
          );
          const inserted = await connection.query(
            `INSERT INTO ${table} (id, document) VALUES ($1, $2::jsonb) RETURNING document`,
            [document._id, JSON.stringify(document)]
          );
          await connection.query("COMMIT");
          if (this.kind === "findOneAndUpdate") {
            return this.options.new || this.options.returnDocument === "after"
              ? new this.Model(inserted.rows[0].document, false)
              : null;
          }
          return {
            acknowledged: true,
            matchedCount: 0,
            modifiedCount: 0,
            upsertedCount: 1,
            upsertedId: document._id,
          };
        }

        const current = found.rows[0].document;
        const before = new this.Model(current, false);
        const updated = applyUpdate(
          this.Model.createDocument(current),
          this.update
        );
        await connection.query(
          `UPDATE ${table} SET document = $2::jsonb WHERE id = $1`,
          [found.rows[0].id, JSON.stringify(updated)]
        );
        await connection.query("COMMIT");
        if (this.kind === "findOneAndUpdate") {
          return this.options.new || this.options.returnDocument === "after"
            ? new this.Model(updated, false)
            : before;
        }
        return {
          acknowledged: true,
          matchedCount: 1,
          modifiedCount: JSON.stringify(current) === JSON.stringify(updated) ? 0 : 1,
          upsertedCount: 0,
          upsertedId: null,
        };
      } catch (error) {
        await connection.query("ROLLBACK");
        throw error;
      } finally {
        connection.release();
      }
    }

    throw new Error(`Unsupported PostgreSQL query type: ${this.kind}`);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }

  finally(callback) {
    return this.exec().finally(callback);
  }
}

function createModel(name, schema) {
  const definition = schemaDefinition(schema);
  const tableName = normalizeModelName(name);
  const defaults = defaultsFor(definition.definition);
  const uniquePaths = uniquePathsFor(definition.definition);
  const requiredPaths = requiredPathsFor(definition.definition);
  const ttlPaths = ttlPathsFor(definition.definition);
  const existing = models.get(name);
  if (existing) return existing;

  class DocumentModel {
    constructor(document = {}, isNew = true) {
      Object.assign(this, clone(defaults), clone(document));
      if (!this._id) this._id = randomUUID();
      Object.defineProperty(this, "_isNew", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: isNew,
      });
    }

    get id() {
      return String(this._id);
    }

    static createDocument(document = {}) {
      return new DocumentModel(document);
    }

    static find(filter = {}, callback) {
      const query = new Query(this, "find", filter);
      return typeof callback === "function"
        ? query.exec(callback)
        : query;
    }

    static findOne(filter = {}, callback) {
      const query = new Query(this, "findOne", filter);
      return typeof callback === "function"
        ? query.exec(callback)
        : query;
    }

    static findById(id, callback) {
      return this.findOne({ _id: String(id) }, callback);
    }

    static findOneAndUpdate(filter, update, options = {}, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      const query = new Query(this, "findOneAndUpdate", filter, update, options);
      return typeof callback === "function" ? query.exec(callback) : query;
    }

    static findByIdAndUpdate(id, update, options = {}, callback) {
      return this.findOneAndUpdate(
        { _id: String(id) },
        update,
        options,
        callback
      );
    }

    static findOneAndDelete(filter, callback) {
      const query = new Query(this, "findOneAndDelete", filter);
      return typeof callback === "function" ? query.exec(callback) : query;
    }

    static findByIdAndDelete(id, callback) {
      return this.findOneAndDelete({ _id: String(id) }, callback);
    }

    static updateOne(filter, update, options = {}, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      const result = new Query(
        this,
        "updateOne",
        filter,
        update,
        options
      ).exec();
      return withCallback(result, callback);
    }

    static deleteOne(filter, callback) {
      return new Query(this, "deleteOne", filter).exec(callback);
    }

    static deleteMany(filter, callback) {
      return new Query(this, "deleteMany", filter).exec(callback);
    }

    static countDocuments(filter = {}, callback) {
      if (typeof filter === "function") {
        callback = filter;
        filter = {};
      }
      const operation = (async () => {
        try {
          const { sql, values } = buildWhere(filter);
          const result = await getPool().query(
            `SELECT COUNT(*)::int AS count FROM "${this.tableName}" WHERE ${sql}`,
            values
          );
          return result.rows[0].count;
        } catch (error) {
          logger.error(
            `PostgreSQL countDocuments failed for ${this.modelName}: ${error.message}`,
            { label: "Database" }
          );
          throw error;
        }
      })();
      return withCallback(operation, callback);
    }

    static exists(filter = {}, callback) {
      if (typeof filter === "function") {
        callback = filter;
        filter = {};
      }
      const operation = this.findOne(filter).then((document) =>
        document ? { _id: document._id } : null
      );
      return withCallback(operation, callback);
    }

    static create(document, callback) {
      const operation = Promise.resolve().then(() => {
        const instance = new this(document);
        return instance.save();
      });
      return withCallback(operation, callback);
    }

    save(callback) {
      return withCallback(this.persist(), callback);
    }

    async persist() {
      const database = getPool();
      const definition = this.constructor.schemaDefinition;
      const document = {};
      for (const [key, value] of Object.entries(this)) {
        if (key !== "_isNew" && value !== undefined) document[key] = value;
      }
      for (const requiredPath of this.constructor.requiredPaths) {
        const value = getPath(document, requiredPath);
        if (value === undefined || value === null) {
          const error = new TypeError(
            `${this.constructor.modelName}.${requiredPath} is required.`
          );
          logger.error(error.message, { label: "Database" });
          throw error;
        }
      }
      if (definition.options.timestamps) {
        const now = new Date().toISOString();
        document.createdAt = document.createdAt || now;
        document.updatedAt = now;
        this.createdAt = document.createdAt;
        this.updatedAt = now;
      }
      try {
        await database.query(
          `INSERT INTO "${this.constructor.tableName}" (id, document) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET document = EXCLUDED.document`,
          [String(document._id), JSON.stringify(document)]
        );
      } catch (error) {
        logger.error(
          `PostgreSQL save failed for ${this.constructor.modelName}: ${error.message}`,
          { label: "Database" }
        );
        throw error;
      }
      Object.assign(this, document);
      this._isNew = false;
      return this;
    }

    updateOne(update, options = {}, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      const operation = this.constructor.updateOne(
        { _id: this._id },
        update,
        options
      ).then((result) => {
        if (result.matchedCount) {
          Object.assign(
            this,
            applyUpdate(this.constructor.createDocument(this), update)
          );
        }
        return result;
      });
      return withCallback(operation, callback);
    }

    deleteOne(options = {}, callback) {
      if (typeof options === "function") {
        callback = options;
      }
      return this.constructor.deleteOne({ _id: this._id }, callback);
    }

    toObject() {
      const result = {};
      for (const [key, value] of Object.entries(this)) {
        if (key !== "_isNew") result[key] = clone(value);
      }
      return result;
    }

    toJSON() {
      return this.toObject();
    }
  }

  DocumentModel.modelName = name;
  DocumentModel.tableName = tableName;
  DocumentModel.schemaDefinition = definition;
  DocumentModel.uniquePaths = uniquePaths;
  DocumentModel.requiredPaths = requiredPaths;
  DocumentModel.ttlPaths = ttlPaths;
  models.set(name, DocumentModel);
  return DocumentModel;
}

function model(name, schema) {
  if (typeof name !== "string") {
    return new Schema(name);
  }
  return createModel(name, schema);
}

async function init(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Configure a PostgreSQL connection string before starting Pogy."
    );
  }
  if (pool) return true;

  const candidate = new Pool({
    connectionString,
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  candidate.on("error", (error) => {
    logger.error(`PostgreSQL pool error: ${error.message}`, {
      label: "Database",
    });
  });

  try {
    await candidate.query("SELECT 1");
    for (const [, Model] of models) {
      await candidate.query(
        `SELECT id FROM "${Model.tableName}" LIMIT 0`
      );
      for (const path of Model.uniquePaths) {
        const pathParts = path.split(".");
        const indexName = `${Model.tableName}_${pathParts
          .join("_")
          .toLowerCase()}_uidx`;
        const sqlPath = `'{${pathParts
          .map((part) => part.replace(/'/g, "''"))
          .join(",")}}'`;
        await candidate.query(
          `CREATE UNIQUE INDEX IF NOT EXISTS "${indexName}" ON "${Model.tableName}" ((document #>> ${sqlPath})) WHERE document #> ${sqlPath} IS NOT NULL`
        );
      }
    }
    const expiringModels = [...models.values()].filter(
      (Model) => Model.ttlPaths.length
    );
    const deleteExpired = async () => {
      for (const Model of expiringModels) {
        for (const path of Model.ttlPaths) {
          const sqlPath = `'{${path
            .split(".")
            .map((part) => part.replace(/'/g, "''"))
            .join(",")}}'`;
          await candidate.query(
            `DELETE FROM "${Model.tableName}" WHERE document #>> ${sqlPath} <= $1`,
            [new Date().toISOString()]
          );
        }
      }
    };
    await deleteExpired();
    expiryCleanup = setInterval(() => {
      deleteExpired().catch((error) => {
        logger.error(`PostgreSQL expiry cleanup failed: ${error.message}`, {
          label: "Database",
        });
      });
    }, 60 * 60 * 1000);
    expiryCleanup.unref();
  } catch (error) {
    if (expiryCleanup) clearInterval(expiryCleanup);
    expiryCleanup = undefined;
    await candidate.end();
    throw new Error(
      `Could not initialize PostgreSQL or validate Pogy's schema: ${error.message}`,
      { cause: error }
    );
  }

  pool = candidate;
  logger.info("PostgreSQL connection established.", { label: "Database" });
  return true;
}

async function close() {
  if (expiryCleanup) clearInterval(expiryCleanup);
  expiryCleanup = undefined;
  if (!pool) return;
  const current = pool;
  pool = undefined;
  await current.end();
  logger.info("PostgreSQL connection pool closed.", { label: "Database" });
}

module.exports = {
  Schema,
  SchemaTypes,
  close,
  getPool,
  init,
  model,
};
