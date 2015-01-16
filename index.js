'use strict';
var async = require('async');

module.exports = {
  wipe: function(db, cb){
    var fns = db.modelNames()
      .map(function(k) {
        return db.model(k);
      })
      .map(function(M){
        return async.series.bind(null, [
          M.remove.bind(M),
          M.collection.dropAllIndexes.bind(M.collection)
        ]);
      });

    async.parallel(fns, cb);
  },
  dump: function(db, Models, cb){
    var out = {};
    if (!Array.isArray(Models)) {
      Models = [Models];
    }
    async.forEach(Models, dump, function(err){
      cb(err, out);
    });

    function dump(Model, done) {
      Model.find({}, function(err, models){
        if (err) {
          return done(err);
        }
        out[Model.modelName] = models;
        done();
      });
    }
  },
  import: function(db, cfg, cb){
    async.forEach(Object.keys(cfg), importModel, cb);

    function importModel(modelName, done) {
      var models = cfg[modelName];
      var Model = db.model(modelName);
      Model.create(models, done);
    }
  }
};