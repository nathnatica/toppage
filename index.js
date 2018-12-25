
let Index = (function() {
  let idxSet = new Set();
  let idx = -1;

   class Index {
     constructor(val) {
       if (val) {
         idx = val;
       }
     }

     set(val) {
       idx = val;
     }

     get() {
       return idx;
     }

     addtoSet(val) {
       idxSet.add(val);
     }

     getFirst() {
       return idxSet.values().next().value;
     }

     getNext(val) {
       for (let v of idxSet) {
         if (v > val) {
           return v;
         }
       }
       return val;
     }

     getBefore(val) {
       let reversed = new Set(Array.from(idxSet).reverse());
       for (let v of reversed) {
         if (v < val) {
           return v;
         }
       }
       return val;
     }

     size() {
       return idxSet.size;
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
