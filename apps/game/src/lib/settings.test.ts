import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, parseSettings, serializeSettings } from './settings';

describe('parseSettings', () => {
  it('ida y vuelta', () => {
    const settings = { version: 1, hapticsEnabled: false } as const;
    expect(parseSettings(serializeSettings(settings))).toEqual(settings);
  });

  it.each([
    ['null', null],
    ['no JSON', 'zzz'],
    ['no objeto', '7'],
    ['otra versión', '{"version":9,"hapticsEnabled":false}'],
  ])('usa los valores por defecto ante %s', (_name, raw) => {
    expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
  });

  it('ignora un tipo incorrecto en un campo concreto', () => {
    expect(parseSettings('{"version":1,"hapticsEnabled":"no"}')).toEqual(DEFAULT_SETTINGS);
  });

  it('la vibración está activada por defecto', () => {
    expect(DEFAULT_SETTINGS.hapticsEnabled).toBe(true);
  });
});
