#!/usr/bin/env node
import process from 'node:process';
import { run } from '../src/cli.js';

run(process.argv.slice(2));
