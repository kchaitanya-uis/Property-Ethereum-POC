App = {
  web3Provider: null,
  profile: {},
  contracts: {},
  account: '0x0',
  loading: false,
  currentState: "0", // 0 is login |
  participantTyle: NaN,
  propertyListArray: new Array(),

  init: function () {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("Property.json", function (property) {
      App.contracts.Property = TruffleContract(property);
      App.contracts.Property.setProvider(App.web3Provider);
      App.contracts.Property.deployed().then(function (property) {
        console.log("Contract Address:", 'https://rinkeby.etherscan.io/address/' + property.address);
        property.version().then((version) => { console.log("Smart-Contract Version:", version) })
        return App.render();
      });
      //App.listenForEvents();
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {

  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html('<spam>Your Account: <a href="https://rinkeby.etherscan.io/address/' + account + '" target="_blank">' + account + '</a></spam>');
      }
    });

    App.LoadUserProfile();


    content.show();
    loader.hide();

  },

  LoadUserProfile: function () {
    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.admins(App.account)
    })
      .then((reply) => {
        console.log("Is user admin ? ", reply);
        App.profile.isAdming = reply;
        return PropertyInstance.owner()
          .then((owner) => {
            App.profile.owner = owner;
            //console.log("Owner", owner, App.account == owner);
            App.LoadAllPropertyPage();
          })
      })
      .catch((error) => {
        console.log("failed loading user profile", error.message);
      });
  },

  LoadAllPropertyPage: function () {
    $('#loader').show();
    $('#content').hide();
    $('#content').empty();

    App.propertyListArray = new Array();

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.propertyIndex()
    }).then((propertyIndex) => {
      console.log("Total Nummber of Property: ", propertyIndex.toNumber());

      if (propertyIndex.toNumber() > 0) {
        for (i = 1; i <= propertyIndex.toNumber(); i++) {
          //console.log("Calling for property", i);
          PropertyInstance.propertys(i)
            .then((property) => {
              //console.log(property)

              let propertyItem = {};
              propertyItem.index = property[7].toNumber();
              propertyItem.created = property[0].toNumber();
              propertyItem.creator = property[1];
              propertyItem.name = property[2];
              propertyItem.addr = property[3];
              propertyItem.desc = property[4];
              propertyItem.price = property[5].toNumber();
              propertyItem.getLoc = property[6];
              //console.log(propertyItem.index, property[7].toNumber());
              App.propertyListArray.push(propertyItem);
              //console.log(propertyIndex.toNumber(), i)
              if (propertyIndex.toNumber() + 1 == i) {
                let str = '<h2>All Property List.</h2>';
                let length = App.propertyListArray.length;

                for (let each in App.propertyListArray) {
                  (function (idx, arr) {
                    str += '<div>Name: ' + arr[idx].name + "</div>";
                    str += '<div>Address: ' + arr[idx].addr + "</div>";
                    str += '<div>Description: ' + arr[idx].desc + "</div>";
                    str += '<div>Price: ' + arr[idx].price + "</div>";
                    str += '<div>GeoLocation: ' + arr[idx].getLoc + "</div>";
                    str += '<button type="button" class="btn btn-success" onclick="App.LoadPropertyDetailPage(' + arr[idx].index + ');">Show More Details</button>';
                    str += '<hr/>';
                    //console.log(length, idx)
                    if (length - 1 == idx) {
                      $('#loader').hide();
                      $('#content').show();
                      $('#content').empty();
                      $('#content').append(str);
                    }
                  })(each, App.propertyListArray)
                }


              }

            })
            .catch((error) => {
              $('#loader').hide();
              $('#content').show();
              console.log("Unable to load property list", error.message);
            })
        }
      } else {
        $('#loader').hide();
        $('#content').show();
        $('#content').append('<h1>No Property Record(s)</h1>');
      }
    })
  },

  LoadPropertyDetailPage: function (index) {
    $('#loader').show();
    $('#content').hide();
    $('#content').empty();
    $('#content').append('<button onclick="App.UpdateOwnerShip(' + index + ');">OWN</button>');
    $('#content').append('<button onclick="App.UpdateCoOwnerShip(' + index + ');">COOWN</button>');
    $('#content').append('<button onclick="App.BuyProperty(' + index + ');">BUY</button>');
    $('#content').append('<button onclick="App.Inherit(' + index + ');">INHERIT</button>');
    $('#content').append('<button onclick="App.Disput(' + index + ');">DISPUTE</button>');
    $('#content').append('<button onclick="App.PropertyTax(' + index + ');">PAYPROPERTYTAX</button>');
    $('#content').append('<button onclick="App.ElectricityBill(' + index + ');">PAYELECBILL</button>');
    $('#content').append('<button onclick="App.WaterBill(' + index + ');">PAYWATERBILL</button>');
    $('#content').append('<button onclick="App.ChangeOwnerShip(' + index + ');">CHANGE</button>');
    $('#content').append('<button onclick="App.ChangeGeo(' + index + ');">GEOTAG</button>');

    console.log("Called for Property index: ", index)
    let str = '';
    let currIndex = index;

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.propertys(index)
    }).then((property) => {
      str += '<div>Created On:' + new Date(property[0].toNumber()) + '</div>';
      str += '<div>Created By:' + property[1] + '</div>';
      str += '<div>Name: ' + property[2] + "</div>";
      str += '<div>Address: ' + property[3] + "</div>";
      str += '<div>Description: ' + property[4] + "</div>";
      str += '<div>Price: ' + property[5] + "</div>";
      str += '<div>GeoLocation: ' + property[6] + "</div>";
      str += '<hr/>';

      return PropertyInstance.getOwners(currIndex);
    }).then((owners) => {

      if (owners.length > 0) {
        for (let each in owners) {
          (function (idx, arr) {
            str += '<div>Owner ' + parseInt(idx + 1) + ': ' + arr[idx] + '</div><button type="button" class="btn btn-danger">X</button>';
            if (owners.length - 1 == idx) {
              str += '<hr/>';
              PropertyInstance.getLogs(currIndex)
                .then((logs) => {
                  if (logs.length > 0) {
                    for (let each in logs) {
                      (function (_idx, _arr) {
                        str += '<div>Logs ' + web3.toAscii(_arr[_idx]) + '</div>';
                        if (logs.length - 1 == _idx) {
                          $('#loader').hide();
                          $('#content').show();
                          $('#content').append(str);
                        }
                      })(each, logs);
                    }
                  }
                })
            } else {
              $('#loader').hide();
              $('#content').show();
              $('#content').append(str);
            }
          })(each, owners)
        }
      } else {

        $('#loader').hide();
        $('#content').show();
        $('#content').append(str);

      }



    })

  },

  UpdateOwnerShip: function (index) {

    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.OWN([A], index, "Owner is A")
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  UpdateCoOwnerShip: function (index) {

    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.OWN([B], index, "Co-Owner A & B")
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  BuyProperty: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.OWN([C], index, "A bought from B")
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  Inherit: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.OWN([C], index, "C bought inherit from A")
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  Disput: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
    let D = "0xaE0ba611606d2744A88F6b0E2835e823Ec52104c"

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.RECORDLOGS(index, "D dispute C")
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  PropertyTax: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
    let D = "0xaE0ba611606d2744A88F6b0E2835e823Ec52104c"

    const mesZ = "Pays Property Tax";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.RECORDLOGS(index, mesZ)
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  ElectricityBill: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
    let D = "0xaE0ba611606d2744A88F6b0E2835e823Ec52104c"

    const mesZ = "Pays Electricity Bill";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.RECORDLOGS(index, mesZ)
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  WaterBill: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
    let D = "0xaE0ba611606d2744A88F6b0E2835e823Ec52104c"

    const mesZ = "Pays Water Bill";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.RECORDLOGS(index, mesZ)
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  ChangeOwnerShip: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
    let D = "0xaE0ba611606d2744A88F6b0E2835e823Ec52104c"

    const mesZ = "Approval from Legal Authority";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.CHANGE_CREATOR(C, index, mesZ)
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  ChangeGeo: function (index) {
    let A = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";
    let B = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";
    let C = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
    let D = "0xaE0ba611606d2744A88F6b0E2835e823Ec52104c"

    const mesZ = "changed geo-tagging";

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.GEOTAG(index, "22.2222,33.3333", mesZ)
    }).then((property) => {
      console.log(property.tx);
      App.LoadPropertyDetailPage(index);
    });
  },

  LoadAddPropertyPage: function () {
    $('#content').load('Add_Property_Form.html')
  },

  SaveProperty: function () {
    $('#loader').show();
    $('#content').hide();

    const name = $('#s_name').val();
    const address = $('#s_address').val();
    const description = $('#s_description').val();
    const price = parseInt($('#s_price').val());
    const ownerArr = [];
    if ($('#s_owner_1').val()) {
      ownerArr.push($('#s_owner_1').val())
    }
    if ($('#s_owner_2').val()) {
      ownerArr.push($('#s_owner_2').val())
    }
    if ($('#s_owner_3').val()) {
      ownerArr.push($('#s_owner_3').val())
    }
    const geo = $('#s_geo').val();

    const logStr = "created by " + App.account;
    const log = [logStr];

    console.log(name, address, description, price, ownerArr, geo);/**/

    //return PropertyInstance.addProperty("Name","Road No 2", "A very nice Home", 2000, [A,B], ["Create","Owned"],"22.3456,33.4567", {from:B});

    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.addProperty(name, address, description, price, ["0x1f9C6bBa334f5b231B9285fa812052257A20D914"], ["created"], "", { from: App.account, gas: 5000000 });
    })
      .then((reply) => {
        console.log(reply.tx)
        $('#loader').hide();
        $('#content').show();
      })
      .catch((error) => {
        console.log("error saving new property", error.message);
        $('#loader').hide();
        $('#content').show();
      })
  },

  LoadAddNewAdminPage: function () {
    $('#content').empty();
    $('#content').load('Add_Admin.html')
  },

  SaveAdmin: function () {
    $('#loader').show();
    $('#content').hide();
    App.contracts.Property.deployed().then(function (instance) {
      PropertyInstance = instance;
      return PropertyInstance.addAdmins($('#s_admin_addr').val(), { from: App.account });
    })
      .then((reply) => {
        console.log("Success", reply.tx);
        $('#loader').hide();
        $('#content').show();
      })
      .catch((error) => {
        console.log("error saving new admin ", error.message)
      })
  },
}

$(function () {
  $(window).load(function () {
    App.init();
  })
});
