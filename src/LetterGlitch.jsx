'use client';

import { useEffect, useRef } from 'react';
import './LetterGlitch.css';

const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';
const DEFAULT_FONT = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const DARK_COLORS = ['#ffffff', '#61dca3'];
const LIGHT_COLORS = ['#18181b', '#0f9f6e'];
const MAX_COLORS = 8;
const INTRO_SECONDS = 1.4;
const REST_RATE = 0.2;
const GLITCH_RATE = 0.1;
const MAX_WALKERS = 48;

const VERTEX =