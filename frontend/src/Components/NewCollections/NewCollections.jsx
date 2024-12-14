import  './NewCollections.css';
import new_collection from '../Assets/new_collections';
import Item from '../Item/Item';
import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../Context/ShopContext';

const NewCollections = () => {
  const [newCollection, setNewCollection] = useState([]);
    const { API} =useContext(ShopContext);
  useEffect(()=> {
    fetch(API+'/newcollections')
    .then((res)=> res.json())
    .then((data)=> setNewCollection(data));
  }, [])
  return (
    <div className='new-collections'>
     <h1>NEW COLLECTIONS</h1>
     <hr />
     <div className="collections">
      {
        new_collection.map((item, i)=> (
         <Item key={i} image={item.image} old_price={item.old_price} new_price={item.new_price} />
        ))
      }
     </div>
    </div>
  )
}

export default NewCollections
