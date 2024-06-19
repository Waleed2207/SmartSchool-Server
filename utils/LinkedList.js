
class ListNode {
    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.next = null;
    }
  }
  
  class LinkedList {
    constructor() {
      this.head = null;
    }
  
    add(id, data) {
      const newNode = new ListNode(id, data);
      if (!this.head || this.head.data.time > data.time) {
        newNode.next = this.head;
        this.head = newNode;
      } else {
        let current = this.head;
        while (current.next && current.next.data.time < data.time) {
          current = current.next;
        }
        newNode.next = current.next;
        current.next = newNode;
      }
    }
  
    remove(id) {
      if (!this.head) return false;
      if (this.head.id === id) {
        this.head = this.head.next;
        return true;
      }
      let current = this.head;
      while (current.next && current.next.id !== id) {
        current = current.next;
      }
      if (current.next) {
        current.next = current.next.next;
        return true;
      }
      return false;
    }
  
    print() {
      let current = this.head;
      while (current) {
        console.log(current.data);
        current = current.next;
      }
    }
  
    contains(id) {
      let current = this.head;
      while (current) {
        if (current.id === id) {
          return true;
        }
        current = current.next;
      }
      return false;
    }
  
    update(id, newData) {
      let current = this.head;
      while (current) {
        if (current.id === id) {
          current.data = newData;
          return true;
        }
        current = current.next;
      }
      return false;
    }
  }
  
  module.exports = LinkedList;