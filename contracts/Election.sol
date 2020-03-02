pragma solidity >= 0.5.0 <0.7.0;

// contract Election {
//     // Store Candidate
//     // Read Candidate
//     // Constructor
//     string public candidate;
//     constructor() public{
//         candidate = "Candidate 1";
//     }
// }

contract Election {

    // string public candidate;
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    // Store account that have voted 
    mapping(address => bool) public voters;
    // Store Candidate
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    constructor () public {
        addCandidate("Candibot 1");
        addCandidate("Candibot 2");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
    }
}