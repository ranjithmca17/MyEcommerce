import './Popular.css';
// import data_product from '../Assets/data';
import Item from '../Item/Item';
import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../Context/ShopContext';


const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const { API } = useContext(ShopContext);
useEffect(()=>{
 fetch(API+'/popularinwomen')
 .then((res)=>  res.json())
 .then((data)=> setPopularProducts(data));
},[])
  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item, i)=>(
            <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
        ))}
      </div>
    </div>
  )
}

export default Popular
