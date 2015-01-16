'use strict';

var should = require('should');
var utils = require('../');

// Setup
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// setup
var db = mongoose.createConnection('mongodb://localhost/m-test-utils-test');
var Car = new Schema({
  model: {
    type: String
  },
  license: {
    type: String,
    unique: true
  }
});
var CarModel = db.model('Car', Car);

before(function(done){
  db.once('error', done);
  db.once('open', done);
});

beforeEach(function(done){
  CarModel.create({
    model: 'Prius',
    license: String(Math.floor(Math.random()*10000))
  }, done);
});

afterEach(function(done){
  CarModel.remove(done);
});

describe('wipe()', function() {
  it('should wipe the db', function(done) {
    utils.wipe(db, function(err){
      should.not.exist(err);
      CarModel.find({
        model: 'Prius'
      }, function(err, cars){
        should.not.exist(err);
        cars.length.should.equal(0);
        done();
      });
    });
  });
});

describe('dump()', function() {
  it('should dump the db', function(done) {
    utils.dump(db, CarModel, function(err, dump){
      should.not.exist(err);
      should.exist(dump);
      should.exist(dump.Car);
      dump.Car.length.should.equal(1);
      dump.Car[0].model.should.equal('Prius');
      done();
    });
  });
});

describe('import()', function() {
  it('should import into the db', function(done) {
    utils.dump(db, CarModel, function(err, dump){
      should.not.exist(err);
      utils.wipe(db, function(err){
        should.not.exist(err);
        utils.import(db, dump, function(err){
          should.not.exist(err);
          done();
        });
      });
    });
  });

  it('should fail to import into the db when key conflict', function(done) {
    utils.dump(db, CarModel, function(err, dump){
      should.not.exist(err);
      utils.import(db, dump, function(err){
        should.exist(err);
        done();
      });
    });
  });
});