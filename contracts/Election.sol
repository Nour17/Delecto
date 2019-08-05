pragma solidity >= 0.4.22 < 0.6.0;

import "./SafeMath.sol";

contract Elections {
    using SafeMath for uint256;

    address public owner;
    struct Candidate {
      uint offChainId;
      string SSN;
      uint voteCount;
      bool exists;
    }
    struct Voter {
      uint offChainId;
      string SSN;
      uint voteWeight;
      bool voted;
      bool exists;
    }

    uint public addCandidatesPhaseStart;
    uint public addCandidatesPhaseEnd;
    uint public votingPhaseStart;
    uint public votingPhaseEnd;

    mapping (address => Candidate) public Candidates;
    mapping (address => Voter) public Voters;

    event ParticipantAdded(address _candidate, uint _id);
    event DelegateAnotherVoter(address _from, address _to, uint _delegateWeight);
    event Voted(address _voter, address _candidate);

    modifier onlyOwner {
        require(msg.sender == owner,
        "Owner must be the invoker of this function");
        _;
    }

    modifier notRegistered(string memory _type, address _address) {
        if(keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("Candidate")))
            require(!Candidates[_address].exists,
            "This candidate is already registered");
        else
            require(!Voters[_address].exists,
            "This voter is already registered");
        _;
    }

    modifier Registered(string memory _type, address _address) {
        if(keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("Candidate")))
            require(Candidates[_address].exists,
            "This candidate is not registered");
        else
            require(Voters[_address].exists,
            "This voter is not registered");
        _;
    }
    
    modifier addingCandidatePhase() {
        require((block.timestamp > addCandidatesPhaseStart && block.timestamp < addCandidatesPhaseEnd),
        "Addidng Candidates phase has ended");
        _;
    }

    modifier VotingPhase() {
        require((block.timestamp > votingPhaseStart && block.timestamp < votingPhaseEnd),
        "Voting phase has ended");
        _;
    }

    constructor (address _owner, uint _addCandidatesPhaseStart, uint _addCandidatesPhasePeriod, uint _votingPhasePeriod) public{
        require(_owner != address(0) &&
        _addCandidatesPhaseStart != 0 &&
        _addCandidatesPhasePeriod != 0 &&
        _votingPhasePeriod != 0,
        "Intilazing Contruct has gone wrong, please check the parameters");

        owner = _owner;
        addCandidatesPhaseStart = _addCandidatesPhaseStart;
        addCandidatesPhaseEnd = calculatePhaseEnding(_addCandidatesPhaseStart, _addCandidatesPhasePeriod);
        votingPhaseStart = addCandidatesPhaseEnd;
        votingPhaseEnd = calculatePhaseEnding(votingPhaseStart, _votingPhasePeriod);
    }

    function AddCandidate(address _candidate, uint _id, string memory _ssn) public
        onlyOwner
        notRegistered("Candidate", _candidate)
        addingCandidatePhase{

        require(_candidate != address(0), "Candidate Address must be valid");

        Candidates[_candidate].offChainId = _id;
        Candidates[_candidate].SSN = _ssn;
        Candidates[_candidate].voteCount = 0;
        Candidates[_candidate].exists = true;

        emit ParticipantAdded(_candidate, _id);
    }

    function RegisterVoter(uint _id, string memory _ssn) public notRegistered("Voter", msg.sender) {
        Voters[msg.sender].offChainId = _id;
        Voters[msg.sender].SSN = _ssn;
        Voters[msg.sender].voteWeight = 1;
        Voters[msg.sender].voted = false;
        Voters[msg.sender].exists = true;

        emit ParticipantAdded(msg.sender, _id);
    }

    function DelegateVoter(address _voter) public Registered("Voter", msg.sender) Registered("Voter", _voter){
        require(!Voters[msg.sender].voted, "You have already voted");
        require(!Voters[_voter].voted, "Delegate have already voted");
        require(msg.sender != _voter, "Can't delegate to yourself");

        Voters[_voter].voteWeight.add(Voters[msg.sender].voteWeight);
        Voters[msg.sender].voteWeight = 0;
        Voters[msg.sender].voted = true;
        emit DelegateAnotherVoter(msg.sender, _voter, Voters[_voter].voteWeight);
    }

    function Vote(address _candidate) public notRegistered("Candidate", _candidate) Registered("Voter", msg.sender) VotingPhase(){
        require(!Voters[msg.sender].voted, "Yop have already voted");

        Candidates[_candidate].voteCount.add(Voters[msg.sender].voteWeight);
        Voters[msg.sender].voteWeight = 0;
        Voters[msg.sender].voted = true;
        emit Voted(msg.sender, _candidate);
    }

    function calculatePhaseEnding(uint _start, uint _period) private pure returns(uint _end) {
        _end = _start + _period;
    }
}