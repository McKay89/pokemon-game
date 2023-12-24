import React, { useState } from 'react'
import Inventory from './MENU/Inventory';
import '../style/Menu.css';
import { transform } from 'framer-motion';

const Menu = ({translation, inventoryData, handleUseItem, handleDropItem}) => {
  const [activeMenu, setActiveMenu] = useState("inventory");

  return (
    <div
        className="adventure-menu-container"
        style={{
            backgroundImage: 'url(images/adventure/inventory/adventure_menu.png)'
        }}
    >
      { activeMenu === "inventory" ?
        <div
          className="menu-inventory"
          style={{
            backgroundImage: 'url(images/adventure/inventory/menu_inventory.png)'
          }}
        >
          <Inventory
            translation={translation}
            inventoryData={inventoryData}
            handleUseItem={handleUseItem}
            handleDropItem={handleDropItem}
          />
        </div>
      : undefined }
    </div>
  )
}

export default Menu