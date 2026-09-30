// index.js
const express = require('express');
const path = require('path');
const { Readable } = require('stream');
const { Sequelize, DataTypes } = require('sequelize');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const videos = require('../data/videos.json');
const E = process.env;