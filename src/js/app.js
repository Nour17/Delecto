particlesJS.load('particles-js', '/assets/particles.json', function() {
  console.log('callback - particles.js config loaded');
});

App = {

  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Elections.json", function(election) {
      App.contracts.Elections = TruffleContract(election);
      App.contracts.Elections.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function() {
    var electionInstance;

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(account);
      }
    });

    // Load contract data
    App.contracts.Elections.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance._totalCandidates;
    }).then(function(totalCandidates) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for (var i = 1; i <= totalCandidates; i++) {
        electionInstance.Candidates(i).then(function(candidate) {
          var offChainid = Candidates[0];
          var SSN = Candidates[1];
          var voteCount = Candidates[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
        });
      }
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
