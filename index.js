
let Index = (function() {
  let privateProps = new Set();

   class Index {
     add(val) {
       privateProps.add(val);
     }

     getFirst() {
       return privateProps.values().next().value;
     }

     getNext(val) {
       for (let v of privateProps) {
         if (v > val) {
           return v;
         }
       }
       return val;
     }

     getBefore(val) {
       let reversed = new Set(Array.from(privateProps).reverse());
       for (let v of reversed) {
         if (v < val) {
           return v;
         }
       }
       return val;
     }

     size() {
       return privateProps.size;
     }
   }

   return Index;
})();

// var a = new Index();
// a.add(0);
// a.add(1);
// a.add(2);
// a.add(3);
// a.add(4);
// a.add(5);
//
// console.log(a.getNext(1));
// console.log(a.getBefore(4));
//
// console.log(a.getNext(5));
// console.log(a.getBefore(0));
