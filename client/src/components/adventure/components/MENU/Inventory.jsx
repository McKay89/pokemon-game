import React, { useState, useEffect } from 'react'
import '../../style/Inventory.css';

const Inventory = ({translation, inventoryData, handleUseItem, handleDropItem}) => {
    const [displayIndex, setDisplayIndex] = useState(0);
    const [activeBag, setActiveBag] = useState("items");
    const [bagCapacity, setBagCapacity] = useState(0);
    const [activeItem, setActiveItem] = useState(null);
    const [isItemInUse, setIsItemInUse] = useState(false);
    const [itemProgressbar, setItemProgressbar] = useState(68);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDisplayIndex(prevIndex => prevIndex + 1);
            setBagCapacity(prevAmount => prevAmount + 1 <= inventoryData[activeBag].length - 1 ? prevAmount + 1 : inventoryData[activeBag].length);

            if (displayIndex === inventoryData[activeBag].length - 1) {
                clearInterval(intervalId);
            }
        }, 35);
    
        return () => clearInterval(intervalId);
    }, [displayIndex]);

    useEffect(() => {
        setActiveItem(null);
    }, [bagCapacity])
    

    const handleSwitchInventory = (type) => {
        setDisplayIndex(0);
        setBagCapacity(0);
        setActiveItem(null);
        setActiveBag(type);
    }

    const openInventoryData = (data, slotIndex) => {
        setActiveItem({
            id: data.id,
            img32: data.img32,
            img64: data.img64,
            img128: data.img128,
            usable: data.usable,
            disposable: data.disposable,
            name: data.name,
            desc: data.desc,
            effect: data.effect,
            slot: slotIndex
        })
    }

    const useItem = (category, id) => {
        setIsItemInUse(true);

        const progressTick = 2000 / 10;
        const progressValue = 68 / progressTick;

        const progressInterval = setInterval(() => {
            setItemProgressbar((prevValue) => prevValue - progressValue);
        }, 10)

        setTimeout(() => {
            clearInterval(progressInterval);
            setItemProgressbar(68);
            handleUseItem(category, id);
            setIsItemInUse(false);
        }, 2000)
    }

    return (
        <div className="inventory-container">
            {/* TITLE */}
                <div className="inventory-title"><span>{translation("adventure:backpack_title")}</span></div>

            {/* CAPACITY */}
                <div className="inventory-capacity-container"><span>{translation("adventure:inventory_capacity")} <span>{bagCapacity} / 24</span></span></div>

            {/* BAG NAME */}
                <div className="inventory-bagname-container"><span>{translation("adventure:" + activeBag + "")}</span></div>

            {/* GOLD */}
                <div className="inventory-gold-container">
                    <span>{new Intl.NumberFormat().format(inventoryData.gold)}</span>
                    <div style={{backgroundImage: `url(/images/adventure/icons/gold.svg)`}}></div>
                </div>

            {/* SLOTS */}
                {inventoryData[activeBag].slice(0, displayIndex + 1).map((element, index) => (
                    <div
                        key={index}
                        className={`inventory-slot inventory-slot${index + 1}`}
                        style={{
                            backgroundImage: `url(${element.img32})`
                        }}
                        onClick={() => !isItemInUse ? openInventoryData(element, index + 1) : undefined}
                    >
                        <span>x{element.amount}</span>
                        { isItemInUse && index + 1 === activeItem.slot ?
                            <div
                                key={`${index}bar`}
                                className="item-using-bar"
                                style={{height: `${itemProgressbar}px`}}
                            >
                            </div>
                        : undefined }
                    </div>
                ))}

            {/* ITEM DETAILS */}
                <div className="inventory-item-container">
                    { activeItem ?
                        <>
                            <div className="inventory-item-image" style={{backgroundImage: `url(${activeItem.img128})`}}></div>
                            <div className="inventory-item-image-glow">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div className="inventory-item-name"><span>{translation(activeItem.name)}</span></div>
                            <div className="inventory-item-desc"><span dangerouslySetInnerHTML={{ __html: translation(activeItem.desc) }}></span></div>
                        </>
                    : undefined }
                </div>

            {/* ITEM ACTIONS */}
                <div className="inventory-item-actions">
                    { activeItem ?
                        <>
                            <div><button disabled={!activeItem.usable || isItemInUse ? "disabled" : undefined } onClick={() => !isItemInUse ? useItem(activeBag, activeItem.id) : undefined} className={!activeItem.usable || isItemInUse ? "inventory-item-use-btn-inactive" : "inventory-item-use-btn"}><i className="fa-solid fa-hands-holding-circle"></i> &nbsp;{translation("adventure:item_use")}</button></div>
                            <div><button disabled={!activeItem.disposable ? "disabled" : undefined } onClick={() => handleDropItem(activeBag, activeItem.id)} className={!activeItem.disposable ? "inventory-item-drop-btn-inactive" : "inventory-item-drop-btn"}><i className="fa-solid fa-trash-can"></i> &nbsp;{translation("adventure:item_drop")}</button></div>
                        </>
                    : undefined }
                </div>

            {/* INVENTORY MENU */}
                <div onClick={() => handleSwitchInventory("items")} className={activeBag === "items" ? "inventory-menu-active inventory-menu1" : "inventory-menu inventory-menu1"}><i className="fa-solid fa-boxes-stacked"></i></div>
                <div onClick={() => handleSwitchInventory("potions")} className={activeBag === "potions" ? "inventory-menu-active inventory-menu2" : "inventory-menu inventory-menu2"}><i className="fa-solid fa-flask"></i></div>
                <div onClick={() => handleSwitchInventory("fruitables")} className={activeBag === "fruitables" ? "inventory-menu-active inventory-menu3" : "inventory-menu inventory-menu3"}><i className="fa-solid fa-apple-whole"></i><i className="fa-solid fa-carrot"></i></div>
                <div onClick={() => handleSwitchInventory("foods")} className={activeBag === "foods" ? "inventory-menu-active inventory-menu4" : "inventory-menu inventory-menu4"}><i className="fa-solid fa-burger"></i></div>
                <div onClick={() => handleSwitchInventory("documents")} className={activeBag === "documents" ? "inventory-menu-active inventory-menu5" : "inventory-menu inventory-menu5"}><i className="fa-solid fa-book"></i></div>
                <div onClick={() => handleSwitchInventory("quests")} className={activeBag === "quests" ? "inventory-menu-active inventory-menu6" : "inventory-menu inventory-menu6"}><i className="fa-solid fa-key"></i></div>
        </div>
    )
}

export default Inventory