import React, { useState, useEffect } from 'react';
import Register from "./authentication/Register";
import Login from "./authentication/Login";
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import VolumeSlider from './extras/VolumeSlider';
import MusicPlayer from './audio/MusicPlayer';
import "../styles/Navbar.css";
import i18next from 'i18next';
import { Link } from 'react-router-dom';



export default function Navbar({translation, handleSidebarHover, user, login, handleLogout}) {
  const [fixSidebar, setFixSidebar] = useState(true);
  const [xpBar, setXpBar] = useState(0);
  const [newMessages, setNewMessages] = useState(4);
  const [newFriends, setNewFriends] = useState(0);
  const [registerOpened, setRegisterOpened] = useState(false);
  const [loginOpened, setLoginOpened] = useState(false);
  const [bgMusic, setBgMusic] = useState("./audio/music/Atom_Music_Audio_Divine.mp3");
  const [bgMusicVolume, setBgMusicVolume] = useState(0.3);
  const [soundsVolume, setSoundsVolume] = useState(0.5);
  const [musicStatus, setMusicStatus] = useState(false);
  const [sfxURLs] = useState({
    menuHoverSFX: "./audio/sounds/menu/sfx_menu_hover.mp3",
    menuClickSFX: "./audio/sounds/menu/sfx_menu_click.mp3"
  });

  const playSFX = (url, volume) => {
    if(musicStatus) {
      const SFX = new Audio(url);
      SFX.volume = volume;
      SFX.play();
    }
  }

  const toggleSidebarFix = () => {
    if(fixSidebar) setFixSidebar(false);
    if(!fixSidebar) setFixSidebar(true);
  }

  const handleHover = () => {
    handleSidebarHover(true);
  }

  const handleMouseLeave = () => {
    handleSidebarHover(false);
  }

  const handleLanguageSwitcher = (event) => {
    const language = event.target.dataset.language;
    i18next.changeLanguage(language);
  }

  const handleOpenRegisterForm = () => {
    setRegisterOpened(!registerOpened);
  }

  const handleOpenLoginForm = () => {
    setLoginOpened(!loginOpened);
  }

  const handleCloseForms = () => {
    setRegisterOpened(false);
    setLoginOpened(false);
  }

  const changeMusicVolume = (value) => {
    setBgMusicVolume(value);
  }

  const changeSoundsVolume = (value) => {
    setSoundsVolume(value);
  }

  const handlerMusicStatus = () => {
    setMusicStatus(!musicStatus);
  }

  useEffect(() => {
    // Calculate actual XP Bar length
    let xpPercent = user.nextLevelXP / 100;
    let actualPercent = user.actualXP / xpPercent;
    setXpBar(actualPercent * 1.2);
  }, [user])

  return (
    <div className="sidebar-main-container">
      <div
        style={{
          backgroundImage: `url(/images/backgrounds/sidebar_bg.png)`
        }}
        onMouseEnter={!fixSidebar ? handleHover : undefined}
        onMouseLeave={!fixSidebar ? handleMouseLeave : undefined}
        className={`sidebar ${fixSidebar ? 'fixed' : ''}`}
      >
        <Tooltip
          title={<span style={{ color: "#fff", fontSize: "14px" }}>{fixSidebar ? translation("unfix_sidebar") : translation("fix_sidebar")}</span>}
          placement='left'
          arrow
          TransitionComponent={Zoom}
          TransitionProps={{ timeout: 600 }}
        >
          <i style={{ color: fixSidebar ? '#0f0' : '#fff' }} onClick={toggleSidebarFix} className="fix-sidebar fa-solid fa-screwdriver-wrench"></i>
        </Tooltip>
        <div className="sidebar-container">
          <div className="user-container">
            { user.logged ?
              <>
                <div className="user-avatar">
                  <Tooltip
                      title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("open_profile_text")}</span>}
                      placement='top'
                      arrow
                      TransitionComponent={Zoom}
                      TransitionProps={{ timeout: 600 }}
                  >
                    <img className="avatar" src={user.avatar} />
                  </Tooltip>
                  <br />
                  <button onClick={handleLogout} className="logout_btn">{translation("logout_btn_text")}</button>
                </div>
                <div className="user-data">
                  <span className="user-username">{user.username}</span>
                  <span className="user-rule">{user.role}</span>
                  <Tooltip
                    title={<span style={{ color: "#fff", fontSize: "14px" }}>{user.xp} / 1000</span>}
                    placement='bottom'
                    arrow
                    TransitionComponent={Zoom}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <div className="xp-bar-container">
                      <span className="user-level">Lv {user.level}&nbsp;</span>
                      <div className="xp-bar">
                        <span style={{width: `${xpBar}px`}} className="xp-bar-active"></span>
                      </div>
                      <span className="user-level">&nbsp;Lv {user.level + 1}</span>
                    </div>
                  </Tooltip>
                </div>
              </>
            : registerOpened || loginOpened ?
              <>
                <div className="user-login-container">
                  <button onClick={handleCloseForms} className="login-btn">{translation("back_text")}</button>
                </div>
              </>
            :
              <>
                <div className="user-login-container">
                  <button onClick={handleOpenLoginForm} className="login-btn">{translation("login_btn_text")}</button>
                </div>
                <div className="user-login-container">
                  <button onClick={handleOpenRegisterForm} className="login-btn">{translation("register_btn_text")}</button>
                </div>
              </>
            }
          </div>
          { user.logged ?
            <div className="menu-container">
              <span className="menu-text">{translation("menu_label_text1")}</span>
              <hr />
              <div className="menu-buttons">
                <ul className="menu-list-container">
                  <Link className="menu-item-link" to={"/testdownload"}>
                    <li
                      onMouseOver={() => playSFX(sfxURLs.menuHoverSFX, soundsVolume)}
                      onClick={() => playSFX(sfxURLs.menuClickSFX, soundsVolume)}
                      className="menu-item"
                    >
                      <i style={{backgroundImage: "url(/images/icons/menu/gamepad.svg)"}} className="menu-icon menu-icon-gamepad"></i> &nbsp;
                      <span>{translation("menu_singleplayer_text")}</span>
                    </li>
                  </Link>
                  <li
                    onMouseOver={() => playSFX(sfxURLs.menuHoverSFX, soundsVolume)}
                    onClick={() => playSFX(sfxURLs.menuClickSFX, soundsVolume)}
                    className="menu-item"
                  >
                    <i style={{backgroundImage: "url(/images/icons/menu/online.svg)"}} className="menu-icon menu-icon-online"></i> &nbsp;
                    <span>{translation("menu_multiplayer_text")}</span>
                  </li>
                  <li
                    onMouseOver={() => playSFX(sfxURLs.menuHoverSFX, soundsVolume)}
                    onClick={() => playSFX(sfxURLs.menuClickSFX, soundsVolume)}
                    className="menu-item">
                    <i style={{backgroundImage: "url(/images/icons/menu/deck.svg)"}} className="menu-icon menu-icon-deck"></i> &nbsp;
                    <span>{translation("menu_deck_text")}</span>
                  </li>
                  <li
                    onMouseOver={() => playSFX(sfxURLs.menuHoverSFX, soundsVolume)}
                    onClick={() => playSFX(sfxURLs.menuClickSFX, soundsVolume)}
                    className="menu-item"
                  >
                    <i style={{backgroundImage: "url(/images/icons/menu/cards.svg)"}} className="menu-icon menu-icon-cards"></i> &nbsp;
                    <span>{translation("menu_collection_text")}</span>
                  </li>
                </ul>
              </div>
              <span className="menu-text">{translation("menu_label_text2")}</span>
              <hr />
              <div className="menu-buttons">
                <ul className="menu-list-container">
                  <li
                    onMouseOver={() => playSFX(sfxURLs.menuHoverSFX, soundsVolume)}
                    onClick={() => playSFX(sfxURLs.menuClickSFX, soundsVolume)}
                    className="menu-item"
                  >
                    <i style={{backgroundImage: "url(/images/icons/menu/message.svg)"}} className="menu-icon menu-icon-message"></i> &nbsp;
                    <span>{translation("menu_messages_text")}</span>
                    <span className={newMessages > 0 ? "menu-messages" : ''}>{newMessages > 0 ? newMessages : ''}</span>
                  </li>
                  <li
                    onMouseOver={() => playSFX(sfxURLs.menuHoverSFX, soundsVolume)}
                    onClick={() => playSFX(sfxURLs.menuClickSFX, soundsVolume)}
                    className="menu-item"
                  >
                    <i style={{backgroundImage: "url(/images/icons/menu/friend.svg)"}} className="menu-icon menu-icon-friend"></i> &nbsp;
                    <span>{translation("menu_friends_text")}</span>
                    <span className={newFriends > 0 ? "menu-friends" : ''}>{newFriends > 0 ? newFriends : ''}</span>
                  </li>
                </ul>
              </div>
              <span className="menu-text">{translation("menu_label_text3")}</span>
              <hr />
              <div className="menu-media-container">
                <div className="menu-media media-music-container">
                  <span className="music-label">{translation("media_music_label")}</span><br />
                  <VolumeSlider translation={translation} volume={bgMusicVolume} changeVolume={changeMusicVolume} musicStatus={musicStatus} />
                </div>
                <MusicPlayer url={bgMusic} translation={translation} initialVolume={bgMusicVolume} handlerMusicStatus={handlerMusicStatus} />
                <div className="menu-media media-sounds-container">
                  <span className="music-label">{translation("media_sounds_label")}</span><br />
                  <VolumeSlider translation={translation} volume={soundsVolume} changeVolume={changeSoundsVolume} musicStatus={musicStatus}/>
                </div>
              </div>
              <span className="menu-text">{translation("menu_label_text4")}</span>
              <hr />
              <div className="menu-language">
                <Tooltip
                      title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("language_english")}</span>}
                      placement='top-end'
                      arrow
                      TransitionComponent={Zoom}
                      TransitionProps={{ timeout: 600 }}
                >
                  <img onClick={(e) => handleLanguageSwitcher(e)} className="menu-flag" src="/images/icons/menu/english.png" data-language="en" />
                </Tooltip>
                <Tooltip
                      title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("language_hungarian")}</span>}
                      placement='top-end'
                      arrow
                      TransitionComponent={Zoom}
                      TransitionProps={{ timeout: 600 }}
                >
                  <img onClick={(e) => handleLanguageSwitcher(e)} className="menu-flag" src="/images/icons/menu/hungarian.png" data-language="hu" />
                </Tooltip>
              </div>
            </div>
          : registerOpened ?
            <Register translation={translation} />
          : loginOpened ?
            <Login translation={translation} login={login} />
          :
            <>
              <div className="info-container">
                <span className="info1">{translation("account_required_text")}</span><br />
                <hr />
                <div className="subinfo-container">
                  <span className="info2">{translation("info_registration_text")}</span>
                </div>
                <div className="subinfo-container">
                  <span className="info3">{translation("info_login_text")}</span>
                </div>
                <hr />
              </div>
              <div className="language-container2">
                <span className="menu-text">{translation("menu_label_text3")}</span>
                <hr />
                <div className="menu-language">
                  <Tooltip
                      title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("language_english")}</span>}
                      placement='top-end'
                      arrow
                      TransitionComponent={Zoom}
                      TransitionProps={{ timeout: 600 }}
                  >
                    <img onClick={(e) => handleLanguageSwitcher(e)} className="menu-flag" src="/images/icons/menu/english.png" data-language="en" />
                  </Tooltip>
                  <Tooltip
                      title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("language_hungarian")}</span>}
                      placement='top-end'
                      arrow
                      TransitionComponent={Zoom}
                      TransitionProps={{ timeout: 600 }}
                  >
                    <img onClick={(e) => handleLanguageSwitcher(e)} className="menu-flag" src="/images/icons/menu/hungarian.png" data-language="hu" />
                  </Tooltip>
                </div>
              </div>
            </>
          }
        </div>
        <div className="sidebar-background">
          <div className="sidebar-light"></div>
        </div>
      </div>
    </div>
  )
}