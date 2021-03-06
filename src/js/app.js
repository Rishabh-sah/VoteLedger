App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  started: false,
  hasVoted: false,
  votingEnded: false,


  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      //App.listenForEvents();

      return App.render();
    });
  },

  // // Listen for events emitted from the contract
  // listenForEvents: function() {
  //   App.contracts.Election.deployed().then(function(instance) {
  //     // Restart Chrome if you are unable to receive this event
  //     // This is a known issue with Metamask
  //     // https://github.com/MetaMask/metamask-extension/issues/2393
  //     instance.votedEvent({}, {
  //       fromBlock: 0,
  //       toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       console.log("event triggered", event)
  //       // Reload when a new vote is recorded
  //       App.render();
  //     });
  //   });
  // },
 

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var x;
    var end;
    loader.show();
    content.hide();
    $('#end').hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.ended();
    }).then(function(ended){
      end=ended;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          if(end){
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          }
          else{
            var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>Hidden</td></tr>"
          candidatesResults.append(candidateTemplate);
          }

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + id + ".  " + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.started();
    }).then(function(started) {
     // Do not allow a user to vote
     x=started;
     if(!started){
      $("#form").hide();
    }
    else{
      $("#form").show();
      $('#start').hide();
      $('#beginning').hide();
    }
    return electionInstance.voters(App.account);
  }).then( function(hasVoted){
     if(hasVoted) {
        $('#form').hide();
      }
      return electionInstance.ended();
    }).then( function(ended){
      //issue here
      
      if(!ended && x){
         $('#end').show();
         $('#start').hide();
       }
       else{
         $("#end").hide();
         $('#start').show();
       } 
       return electionInstance.admin();
     }).then( function(admin){
      if(admin!=App.account || end){
        $("#end").hide();
        $("#start").hide();
        $("#beginning").hide();
      }   
      loader.hide();
      content.show();  
     }).catch(function(error) {
      console.warn(error);
    });
  
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
   addCandidate: function(){
    var candidateName=$('#name').val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.addCandidate(candidateName,{from: App.account})
    }).then(function(result) {
      // Wait for candidates to get added
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
  begin: function(){
    App.contracts.Election.deployed().then(function(instance){
      return instance.start({from: App.account})
    }).then(function(result) {
      // Wait for election to start
      $("#content").hide();
      $("#loader").show();  
    }).catch(function(err) {
      console.error(err);
    });
  },
  finish: function(){
    App.contracts.Election.deployed().then(function(instance){
      return instance.end({from : App.account})
    }).then(function(result) {
      // Wait for election to start
      $("#content").hide();
      $("#loader").show();  
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $( window).load(function() {
    App.init();
  });
});

window.addEventListener('load', async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
      // Acccounts now exposed
      web3.eth.sendTransaction({/* ... */});
    } catch (error) {
      // User denied account access...
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // Acccounts always exposed
    web3.eth.sendTransaction({/* ... */});
  }
  // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
});