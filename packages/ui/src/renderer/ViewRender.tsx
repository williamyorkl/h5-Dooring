import React, { memo } from 'react';
import type { ItemCallback } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import DynamicEngine from './DynamicEngine';
import styles from './viewRender.less';

interface PointDataItem {
  id: string;
  item: Record<string, any>;
  point: Record<string, any>;
}

interface ViewProps {
  pointData: PointDataItem[];
  pageData?: any;
  width?: number;
  dragStop?: ItemCallback;
  onDragStart?: ItemCallback;
  onResizeStop?: ItemCallback;
}

const ViewRender = memo((props: ViewProps) => {
  // 该组件用了memo保存状态
  // NOTE: 3. 可以直接结构props，即可拿到父组件传递过来的参数
  // 注意，这里还有其他的参数，说明这个组件不只有一个地方用到（width, dragStop, onDragStart, onResizeStop）
  const { pointData, pageData, width, dragStop, onDragStart, onResizeStop } = props;

  return (
    <GridLayout
      cols={24}
      rowHeight={2}
      width={width}
      margin={[0, 0]}
      onDragStop={dragStop}
      onDragStart={onDragStart}
      onResizeStop={onResizeStop}
      style={{
        minHeight: '100vh',
        backgroundColor: pageData && pageData.bgColor,
        backgroundImage:
          pageData && pageData.bgImage ? `url(${pageData.bgImage[0].url})` : 'initial',
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* NOTE - 3.1 遍历坐标点的数据,渲染到页面上
       *          - "value" 为 id, item(当前组件被用户设置的属性), position, 状态('inToCanvas'/'xxx'/...), ...
       *          - 被渲染的模块符合 "响应式可拖拽"
       */}
      {pointData.map((value: PointDataItem) => (
        <div key={value.id} data-grid={value.point} className={onDragStart && styles.dragItem}>
          {/* NOTE - 3.2 传到核心渲染组件,进一步渲染工作
           *       - 核心渲染组件需要属性: item { category, config, editableEl, h, type, x  }
           */}
          <DynamicEngine {...(value.item as any)} isTpl={false} />
        </div>
      ))}
    </GridLayout>
  );
});

export default ViewRender;
