pragma solidity >=0.4.21 <0.7.0;

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
    bool public started=false;
    bool public ended=false;
	address public admin;
    // Store account that have voted 
    mapping(address => bool) public voters;
    // Store Candidate
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;
    //Store Voters Count
    mapping(uint => uint) votersCount;
    mapping(uint =>address) voter;
    constructor () public {
		admin=msg.sender;
        for(uint i=0;i<votersCount[0];i++){
        voters[voter[i]]=false;
        }
    }

    function addCandidate (string memory _name) public {
		if(msg.sender==admin && started==false){
			candidatesCount ++;
			candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
		}
		else{
		require(
			msg.sender == admin,
			"Sender not authorized."
		);
        require(
            started==false,
            "Can't add Candidate in between Election"
        );
		}		
    }
    function vote (uint _candidateId) public  {
        // require that they haven't voted before
        require(!voters[msg.sender]);
        //Election is started
        require(started,"Election has not yet been started");
        require(!ended,"Election has been ended");
        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;
        votersCount[0] ++;
        voter[votersCount[0]]=msg.sender;
        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
    }
    function start() public {
        require(msg.sender==admin);
        require(!started);
        require(!ended);
        started=true;
    }
    function end() public{
        require(msg.sender==admin);
        require(started==true);
        ended=true;
    }
}