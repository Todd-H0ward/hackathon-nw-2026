import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseResearchVoiceCommand as parse } from '../src/shared/voice/intents.ts';
for (const phrase of ['сделай импульс', 'бро сделай импульс', 'пожалуйста импулс']) {
 test(phrase, () => assert.deepEqual(parse(phrase), { type: 'intent', intent: 'impulse' }));
}
for (const phrase of ['не делай импульс', 'импульс и пауза', 'увеличь шум и сделай импульс', 'шум 50 и ресурс 80', 'случайный разговор']) {
 test(`отклоняет: ${phrase}`, () => assert.equal(parse(phrase), null));
}
for (const [phrase, result] of [
 ['деактивируй мутации', { type: 'mutation', value: false }],
 ['включи мутации', { type: 'mutation', value: true }],
 ['скорость пять', { type: 'speed', value: 5 }],
 ['увеличь приток на десять', { type: 'setting', setting: 'resource', mode: 'relative', value: 10 }],
 ['установи шум на пятьдесят', { type: 'setting', setting: 'noise', mode: 'absolute', value: 50 }],
 ['покажи график мощности', { type: 'intent', intent: 'power' }],
 ['один такт', { type: 'intent', intent: 'step' }],
]) test(phrase, () => assert.deepEqual(parse(phrase), result));
