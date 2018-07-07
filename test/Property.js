var Property = artifacts.require("./Property.sol");

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));


contract('Initialize Property Smart-Contract.', function(accounts){

    
    const A = accounts[0];
    const B = accounts[1];
    const C = accounts[2];
    const D = accounts[3];
    const E = accounts[4];
    const F = accounts[5];
    const G = accounts[6];
    const H = accounts[7];
    const I = accounts[8];
    const J = accounts[9];


    it("Initialized the Agrichain project.", function(){
        return Property.deployed().then(function(instance){
            PropertyInstance = instance;
            return PropertyInstance.version();
        }).then((owner)=>{
            assert.equal(owner, "0.0.1", 'Correct version.');
        })
    });

    it("Assign a admin.", function(){
        return Property.deployed().then(function(instance){
            PropertyInstance = instance;
            return PropertyInstance.admins(B);
        }).then((owner)=>{
            assert.equal(owner, false, 'B is not yet added as Admin.');
            return PropertyInstance.addAdmins(B,{from:C});
        }).then(assert.fail).catch(function(error){
            //console.log("Check B with C",error.message);
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return PropertyInstance.addAdmins(B,{from:A});
        }).then((reply)=>{
            //console.log("Check B with A", reply);
            return PropertyInstance.admins(B);
        }).then((owner)=>{
            //console.log(owner)
            assert.equal(owner, true, 'B is has been added as Admin.');
        })
    });


    it("Create new Property.", function(){
        return Property.deployed().then(function(instance){
            PropertyInstance = instance;
            return PropertyInstance.addProperty("Name","Road No 2", "A very nice Home", 2000, [A,B], ["Create","Owned"],"22.3456,33.4567", {from:B});
        }).then((reply)=>{
            console.log(reply.tx);
            return PropertyInstance.propertys(1);
        }).then((property)=>{
            //console.log(property);
            return PropertyInstance.getOwners(1);
        }).then((owners)=>{
            //console.log(property);
            assert.equal(owners[0], A, 'A is an owner.');
            assert.equal(owners[1], B, 'B is an owner.');

            return PropertyInstance.getLogs(1);
        }).then((logs)=>{
            //console.log(web3.toAscii(logs[0]));
            ///console.log(web3.toAscii(logs[1]));
            return PropertyInstance.addProperty("Name1","Road No 3", "A very nice Home2", 3000, [C], ["Create1","Owned1"],"22.3456,33.4567", {from:C});
        }).then(assert.fail).catch(function(error){
            console.log("Check B with C",error.message);
           // assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
           return PropertyInstance.modifyOwnership(1, 0, C, {from:B});

        }).then((receipt)=>{
            console.log(receipt.tx);
            return PropertyInstance.getOwners(1);
        }).then((owners)=>{
            //console.log(property);
            assert.equal(owners[0], B, 'B is an owner.');
            assert.equal(owners[1], C, 'C is an owner.');
        })
    })

});