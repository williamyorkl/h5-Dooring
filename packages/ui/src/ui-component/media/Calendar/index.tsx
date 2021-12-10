import React, { useState, memo, useEffect, useRef } from 'react';
import { Calendar } from 'zarm';
import styles from './index.less';
import type { ICalendarConfig } from './schema';
import logo from '@/assets/calend.png';

// NOTE - 6. CalendarCp 函数组件根据 isTpl 字段, 渲染出:
/**
 * a: 左边可以被拖动的模板
 * b: 右边对应渲染的模板
 */
const CalendarCp = memo((props: ICalendarConfig & { isTpl: boolean }) => {
  // NOTE - 6.1 这里的 props 接受的类型参数 ICalendarConfig 并集 isTpl
  const { time, range, color, selectedColor, round, isTpl } = props;

  const realRange = range.split('-');

  // NOTE - 6.2 这里的 value 是下面显示的数组 [data1, data2]
  const [value, setValue] = useState<Date[] | undefined>([
    new Date(`${time}-${realRange[0]}`),
    new Date(`${time}-${realRange[1]}`),
  ]);

  // TODO - 6.3 这里会有点疑问... 只拿到一个值,后面是通过哪个函数来进行操作值的变化?
  const [min] = useState(new Date(`${time}-01`));
  const [max] = useState(new Date(`${time}-31`));

  const boxRef = useRef<any>(null);

  // NOTE - 6.4  useEffect 传入一个空数组, 相当于时 mounted 后执行 (只会执行一次)
  useEffect(() => {
    // NOTE - 6.5 关于.current, 即是其对应的最直接的 dom 元素

    if (boxRef.current) {
      boxRef.current.style.setProperty('--color', color);
      boxRef.current.style.setProperty('--selectColor', selectedColor);
      boxRef.current.style.setProperty('--selectBgColor', selectedColor);
    }
  }, []);

  const isEditorPage = window.location.pathname.indexOf('editor') > -1;

  // NOTE 6.6 下面这堆就是按条件渲染, 下面的逻辑比较清晰
  return (
    <>
      {isTpl ? (
        <div>
          <img src={logo} style={{ width: '100%' }} alt="h5-dooring日历组件" />
        </div>
      ) : (
        <div
          className={styles.calenderWrap}
          style={{ borderRadius: round + 'px', pointerEvents: isEditorPage ? 'none' : 'initial' }}
          ref={boxRef}
        >
          <Calendar
            multiple={!!range}
            value={value}
            min={min}
            max={new Date(max)}
            disabledDate={(date: any) => /(0|6)/.test(date.getDay())}
            onChange={(value: Date[] | undefined) => {
              setValue(value);
            }}
          />
        </div>
      )}
    </>
  );
});

export default CalendarCp;
