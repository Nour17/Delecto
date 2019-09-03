var Election = artifacts.require("Elections");
const truffleAssert = require('truffle-assertions');

// The test contract take the array of the testrpc and pass it
// I took the firt element from this array and assigns it to owner
contract("Election", function(accounts) {
    var electionInstance;
    var addCandidatesPhaseStart = 1567538702;
    let addCandidatesPhasePeriod = 86400;
    let votingPhasePeriod = 86400;

    // beforeEach function will run before each test
    // creating a new instance of electionInstance each time
    beforeEach('Setup contract for each test', async function() {
    electionInstance = await Election.new(accounts[0], addCandidatesPhaseStart,
                                            addCandidatesPhasePeriod, votingPhasePeriod );
    });

    it("Check if contract has an owner", async function() {
        // Assert that the electionInstance.owner() is the same owner
        // i passed in the contract parameters
        assert.equal(await electionInstance.owner(), accounts[0])
    });

    it("Adding new candidate - Valid", async function() {
        return electionInstance.AddCandidate(accounts[1], 1, "12345678912345", {from: accounts[0]}).then(function (result) {
            assert.equal('0x1', result.receipt.status, "New Candidate Added Successfully");
            return electionInstance.AddCandidate(accounts[2], 1, "12345678912345", {from: accounts[0]});
        }).then(function (result) {
            assert.equal('0x1', result.receipt.status, "New Candidate Added Successfully")
        })
    });

    it("Adding new candidate - Invalid(Candidate Already registered)", async function() {
        return electionInstance.AddCandidate(accounts[1], 1, "12345678912345", {from: accounts[0]}).then(function (result) {
            assert.equal('0x1', result.receipt.status, "New Candidate Added Successfully");
        }).then(async function () {
            await truffleAssert.reverts(electionInstance.AddCandidate(accounts[1], 1, "123456678912345", {from: accounts[0]}));
        });
    });

    it("Adding new candidate - Invalid(Invoker is not the owner)", async function() {
        await truffleAssert.reverts(electionInstance.AddCandidate(accounts[1], 1, "12345678912345", {from: accounts[1]}));
    });

    it("Adding new candidate - Invalid(Address '0')", async function() {
        await truffleAssert.reverts(electionInstance.AddCandidate('0x0000000000000000000000000000000000000000', 1, "12345678912345", {from: accounts[0]}));
    });

    it("Adding new voter - Valid", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function (result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.RegisterVoter(2, "12345678912345", {from: accounts[2]});
        }).then(function (result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully")
        })
    });

    it("Adding new voter - Invalid(Voter Already registered)", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function (result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
        }).then(async function () {
            await truffleAssert.reverts(electionInstance.RegisterVoter(2, "123456678912345", {from: accounts[1]}));
        });
    });

    it("Delegate voter - Valid", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[2]});
        }).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.DelegateVoter(accounts[2], {from: accounts[1]});
        }).then(function(result) {
            assert.equal('0x1', result.receipt.status, "Delegation done");
        });
    })

    it("Delegate voter - Invalid( Sender is not registered )", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[2]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
        }).then(async function(result) {
            await truffleAssert.reverts(electionInstance.DelegateVoter(accounts[2], {from: accounts[1]}), "This voter is not registered");
        });
    })

    it("Delegate voter - Invalid( Receiver is not registered )", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
        }).then(async function(result) {
            await truffleAssert.reverts(electionInstance.DelegateVoter(accounts[1], {from: accounts[2]}), "This voter is not registered");
        });
    })

    it("Delegate voter - Invalid( Delegete themself )", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
        }).then(async function(result) {
            await truffleAssert.reverts(electionInstance.DelegateVoter(accounts[1], {from: accounts[1]}), "Can't delegate to yourself" );
        });
    })

    it("Delegate voter - Invalid( 0 votes left )", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[2]});
        }).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.DelegateVoter(accounts[2], {from: accounts[1]});
        }).then(async function(result) {
            assert.equal('0x1', result.receipt.status, "Delegation done");
            await truffleAssert.reverts(electionInstance.DelegateVoter(accounts[2], {from: accounts[1]}),  "You have already voted");
        });
    })

    it("Delegate voter - Invalid( Delegate Already Voted )", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[2]});
        }).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.DelegateVoter(accounts[2], {from: accounts[1]});
        }).then(async function(result) {
            assert.equal('0x1', result.receipt.status, "Delegation done");
            await truffleAssert.reverts(electionInstance.DelegateVoter(accounts[1], {from: accounts[2]}), "Delegate have already voted");
        });
    })

    it("Vote - Valid", async function() {
        return electionInstance.AddCandidate(accounts[1], 2, "12345678912345", {from: accounts[0]}).then(function(result) {
            assert.equal('0x1', result.receipt.status, "Candidate Added Successfully");
            return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[2]});
        }).then(function(result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            return electionInstance.Vote(accounts[1], {from: accounts[2]});
        }).then(function(result) {
            assert.equal('0x1', result.receipt.status, "Voting Done Successfully");
        });
    });

    it("Vote - Invalid ( Candidate is not registered )", async function() {
        return electionInstance.RegisterVoter(1, "12345678912345", {from: accounts[1]}).then(async function (result) {
            assert.equal('0x1', result.receipt.status, "New Voter Added Successfully");
            await truffleAssert.reverts(electionInstance.Vote(accounts[2], {from: accounts[1]}), "This candidate is not registered");
        });
    });

    it("Vote - Invalid ( Voter is not registered )", async function() {
        return electionInstance.AddCandidate(accounts[1], 2, "12345678912345", {from: accounts[0]}).then( async function(result) {
            assert.equal('0x1', result.receipt.status, "Candidate Added Successfully");
            await truffleAssert.reverts(electionInstance.Vote(accounts[1], {from: accounts[2]}), "This voter is not registered");
        });
    });
});