/**
 * Created by xingyongkang on 17-12-27.
 */
//function HallRoom(){
//    this.name = 'Hall Room';
//    console.log('start hallroom');
//}
//
//HallRoom.prototype = new Room(320,160,true);
////HallRoom.prototype.constructor = HallRoom;
//HallRoom.prototype.dealMessage = function(){
//    console.log('i am dealMessage');
//}
function HallRoom(width,height){
    console.log('start hall room');
    Room.call(this,width,height);
    this.name = 'hall';

}
createSubClass(Room,HallRoom);

HallRoom.prototype.dealMessage = function() {
    console.log('i am dealMessage');
};

