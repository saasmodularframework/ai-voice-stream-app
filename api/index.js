// index.js
const express = require('express');
const path = require('path');
const { Readable } = require('stream');
const { Sequelize, DataTypes } = require('sequelize');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const videos = require('../data/videos.json');
const E = process.env;

const sequelize = E.DATABASE_URL
  ? new Sequelize(E.DATABASE_URL, { logging: false, dialectModule: require('pg') })
  : new Sequelize({ dialect: 'sqlite', storage: '/tmp/app.sqlite', logging: false });
const Session = sequelize.define('Session', { videoId: DataTypes.STRING, channel: DataTypes.STRING, agentId: DataTypes.STRING });
const Message = sequelize.define('Message', { role: DataTypes.STRING, content: DataTypes.TEXT });
Session.hasMany(Message);
const Event = sequelize.define('Event', { type: DataTypes.STRING, videoId: DataTypes.STRING, payload: DataTypes.TEXT });
const ready = sequelize.sync();