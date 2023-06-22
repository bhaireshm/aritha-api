const SwaggerParser = require("swagger-parser");
const axios = require("axios");

const path = require("path");
const apiDocsPath = path.join("public", "aritha.json"); // http://192.168.1.106:8080/v2/api-docs

var apiDocs = {};
var defaultOptions = {};

SwaggerParser.validate(apiDocsPath, (err, api) => {
  if (err) {
    console.error(err);
  } else {
    console.log("API name: %s, Version: %s", api.info.title, api.info.version);
    apiDocs = constructData(api);

    fetch("getEmployees", { params: { pageNo: 2, pageSize: 5 } })
      // fetch("saveEmployee", {
      //   data: {
      //     id: 250,
      //     firstName: "Bhairesh",
      //     lastName: "M",
      //   },
      // })
      .then((result) => {
        console.log(result.data.content);
        // console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

function constructData(api) {
  if (api) {
    // * Find whether the given file is OPENAPI or SWAGGER

    const output = [];
    const routes = {};
    Object.entries(api.paths).forEach((a) => {
      output.push({
        url: a[0],
        paths: a[1],
      });
    });

    output.forEach((o) => {
      const singleRoutePaths = o.paths;
      const url = o.url;

      Object.entries(singleRoutePaths).forEach((a) => {
        routes[a[1]["operationId"]] = { method: a[0], path: url, ...a[1] };
      });
    });

    return {
      host: api.servers[0].url || "URL NOT FOUND",
      paths: routes || {},
      info: api.info || {},
    };
  } else console.error("API docs is empty.");
}

function getHeaders() {
  if (apiDocs) {
  }
}

async function fetch(id, options) {
  // * Find the path/route in apiDocs based on ID

  // * Get authentiction details

  // * Prepare Options with headers, payload
  const route = apiDocs.paths[id];
  const url = apiDocs.host + route.path.substr(1);

  // validate the params, query params, body
  const params = options.params; // validateData(options.params, route.parameters);
  // const queryParams = validateData(options.queryParams, route.parameters);
  // const body = validateData(options.body, route.requestBody);

  defaultOptions = {
    responseType: "application/json",
    method: route.method,
    url: url,
    params: params || {},
    data: options.data || {},
  };

  console.log(defaultOptions);
  // defaultOptions = { ...defaultOptions, ...options };

  // * Call axios method and return object.
  return axios(defaultOptions);
}

function validateData(options, schemaTree) {
  try {
    const dataKeys = Object.keys(options);
    const schemaKeys = Object.keys(schemaTree);
    const validate = dataKeys.map((d) => schemaKeys.some((s) => s == d));

    if (validate.filter((b) => !b).length > 0) {
      const out = [];
      validate.forEach((c, i) => {
        if (!c) out.push(`"${dataKeys[i]}" is not found in the schema.`);
      });
      return { errors: out };
    } else {
      return options;
    }
  } catch (err) {
    return err;
  }
}
