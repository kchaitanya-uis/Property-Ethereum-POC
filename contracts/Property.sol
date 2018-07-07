pragma solidity ^0.4.23;

contract Property {

  //enum PropertyAction {OWN,COOWN,BUY,INHERIT,DISPUTE,PAYPROPERTYTAX,PAYELECBILL,PAYWATERBILL,CHANGE,GEOTAG}

  struct PropertyProp{
    uint256 created;
    address creator;
    string name;
    string addr;
    string desc;
    uint256 price;
    address[] owners;
    bytes32[] logs;
    string getLoc;
    uint256 index;
  }

  //struct Actions{
  //  PropertyAction actions;
  //}

  mapping(uint256 => PropertyProp) public propertys;
  //mapping(uint256 => address[]) public modifiers;
  mapping(address => bool) public admins;

  address public owner;
  uint256 public propertyIndex;
  string public version = "0.0.1";

  modifier isOwner() {
    require (msg.sender == owner);
    _;
  }

  modifier isAdmin() {
    require(admins[msg.sender]);
    _;
  }

  constructor() public {
    owner = msg.sender;
    admins[msg.sender] = true;
  }

  function addAdmins(address _addr) public isOwner {
    admins[_addr] = true;
  }

  function addProperty(string _name,
    string _addr,
    string _desc,
    uint256 _price,
    address[] _owners,
    bytes32[] _logs,
    string _geoLoc) public isAdmin {

    propertyIndex++;
    propertys[propertyIndex] = PropertyProp(
      now, 
      msg.sender, 
      _name, 
      _addr, 
      _desc, 
      _price, 
      _owners,
      _logs,
      _geoLoc,
      propertyIndex);

  }

  function updateProperty(uint256 index,
    string _name,
    string _addr,
    string _desc,
    uint256 _price,
    address[] _owners,
    bytes32[] _logs,
    string _geoLoc) public isAdmin {

      require(index <= propertyIndex);

      propertys[index].name = _name;
      propertys[index].addr = _addr;
      propertys[index].desc = _desc;
      propertys[index].price = _price;
      propertys[index].owners = _owners;
      propertys[index].logs = _logs;
      propertys[index].getLoc = _geoLoc;
  }

  function getLogs(uint256 _index) public view returns(bytes32[]){
    return propertys[_index].logs;
  }

  function removeLogs(uint256 proIndex, uint index) public isAdmin () {
    if (index >= propertys[proIndex].logs.length) return;

    for (uint i = index; i<propertys[proIndex].logs.length-1; i++){
      propertys[proIndex].logs[i] = propertys[proIndex].logs[i+1];
    }
    delete propertys[proIndex].logs[propertys[proIndex].logs.length-1];
    propertys[proIndex].logs.length--;
  }

  function wrightLogs(uint256 _index, bytes32 text) public isAdmin (){
    propertys[_index].logs.push(text);
  }



  function getOwners(uint256 _index) public view returns(address[]){
    return propertys[_index].owners;
  }

  function removeOwnership(uint256 proIndex, uint index) public isAdmin {
    if (index >= propertys[proIndex].owners.length) return;

    for (uint i = index; i<propertys[proIndex].owners.length-1; i++){
      propertys[proIndex].owners[i] = propertys[proIndex].owners[i+1];
    }
    delete propertys[proIndex].owners[propertys[proIndex].owners.length-1];
    propertys[proIndex].owners.length--;
  }

  function addOwnership(address newOwner, uint256 index) public isAdmin{
    propertys[index].owners.push(newOwner);
  }

  // CHANGES

  function OWN(address[] newOwner, uint256 _index, bytes32 mesz) public {
    for (uint i = 0; i<propertys[_index].owners.length; i++){
      delete propertys[_index].owners[i];
    }
    for(uint j = 0; j<newOwner.length; j++){
      propertys[_index].owners[j] = newOwner[j];
    }
    propertys[_index].logs[propertys[_index].logs.length] = mesz;
  }

  function RECORDLOGS(uint256 _index, bytes32 mesz) public {
    propertys[_index].logs[propertys[_index].logs.length] = mesz;
  }

  function CHANGE_CREATOR(address _addr, uint256 _index, bytes32 mesz) public {
    propertys[_index].creator = _addr;
    propertys[_index].logs[propertys[_index].logs.length] = mesz;
  }

  function GEOTAG(uint256 _index, string _geo, bytes32 mesz) public {
    propertys[_index].getLoc = _geo;
    propertys[_index].logs[propertys[_index].logs.length] = mesz;
  }

}
