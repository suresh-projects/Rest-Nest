import { Pipe, PipeTransform } from '@angular/core';
import { AMENITIES, HUBS, Opt, PURPOSES, RULES, STATUSES } from './labels';
import { minToLabel, toMin } from './utils';

const LISTS: Record<string, Opt[]> = {
  hub: HUBS, amenity: AMENITIES, rule: RULES, purpose: PURPOSES, status: STATUSES,
};

@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform(code: string | null | undefined, kind: 'hub' | 'amenity' | 'rule' | 'purpose' | 'status'): string {
    if (!code) return '';
    return LISTS[kind].find(o => o.code === code)?.label ?? code;
  }
}

@Pipe({ name: 'icon' })
export class IconPipe implements PipeTransform {
  transform(code: string | null | undefined, kind: 'amenity' | 'rule'): string {
    if (!code) return '';
    return LISTS[kind].find(o => o.code === code)?.icon ?? '•';
  }
}

@Pipe({ name: 'time12' })
export class Time12Pipe implements PipeTransform {
  transform(t: string | null | undefined): string {
    return t ? minToLabel(toMin(t)) : '';
  }
}
