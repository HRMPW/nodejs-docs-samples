/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Datastore = require('@google-cloud/datastore');

// Instantiates a client
const datastore = Datastore();
const cors = require('cors')({origin: true});

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {string} requestKey The key in query string
 * @returns {object} Datastore key object.
 */
function getKeyFromRequestData (requestKey) {
  if (!requestKey) {
    throw new Error('Key not provided. Make sure you have a "key" property in your request');
  }

  return datastore.key(["products", requestKey]);
}

/**
 * Retrieves a record.
 *
 * @example
 * gcloud beta functions call get --data '{"kind":"Task","key":"sampletask1"}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.products = function products (req, res) {
  cors(req, res, () => {
    const key = getKeyFromRequestData(req.query.term.toLowerCase());

    return datastore.get(key)
      .then(([entity]) => {
      // The get operation will not fail for a non-existent entity, it just
      // returns null.
        if (!entity) {
          throw new Error(`No entity found for key ${key.path.join('/')}.`);
        }

        res.status(200).send(entity.matches.map(JSON.parse));
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
        return Promise.reject(err);
      });
    });
};
