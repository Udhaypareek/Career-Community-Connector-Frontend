import React from 'react'
import { Link } from 'react-router-dom';

export default function cards() {
  return (
    <div ClassName="card" style={{ width: '18rem' }}>
  <img src="..." ClassName="card-img-top" alt="..."/>
  <div ClassName="card-body">
    <h5 ClassName="card-title">Private Chats</h5>
    <p ClassName="card-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, dicta iure. Iusto ipsa accusamus eaque doloribus, dolores iste eius eveniet, aspernatur et quo voluptas. Nobis consequatur optio ratione, atque pariatur facilis quos omnis fugit!</p>
    <Link to="/chats" ClassName="btn btn-primary">Click to Talk!</Link>
  </div>
</div>
  )
};


