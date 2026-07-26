import {addDays,dateFromKey,localDateKey,startOfWeek,weekDateKeys} from '../date-utils';

describe('local planning dates',()=>{
 it('uses stable local calendar keys without UTC shifts',()=>{
  expect(localDateKey(new Date(2026,6,26,23,30))).toBe('2026-07-26');
  expect(localDateKey(dateFromKey('2026-07-26'))).toBe('2026-07-26');
 });

 it('builds Monday-to-Sunday weeks and crosses month boundaries',()=>{
  expect(startOfWeek('2026-07-26')).toBe('2026-07-20');
  expect(weekDateKeys('2026-07-26')).toEqual([
   '2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-24','2026-07-25','2026-07-26',
  ]);
  expect(addDays('2026-07-31',1)).toBe('2026-08-01');
 });
});
