import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { ItemCallback } from 'react-grid-layout';
import { connect } from 'dva';
import styles from './index.less';
import { uuid } from '@/utils/tool';
import { Dispatch } from 'umi';
import { StateWithHistory } from 'redux-undo';
import { Menu, Item, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
interface SourceBoxProps {
  pstate: { pointData: { id: string; item: any; point: any; isMenu?: any }[]; curPoint: any };
  cstate: { pointData: { id: string; item: any; point: any }[]; curPoint: any };
  scaleNum: number;
  canvasId: string;
  allType: string[];
  dispatch: Dispatch;
  dragState: { x: number; y: number };
  setDragState: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
}
const ViewRender = React.lazy(() => import('dooringUI/viewRender'));

// memo 相当于 pureComponent, 如果props 没有发生变化, 则 memo 的组件, 也不会重新渲染 (但是也是浅对比)(可以通过传参控制对比结果)
const TargetBox = memo((props: SourceBoxProps) => {
  const { pstate, scaleNum, canvasId, allType, dispatch, dragState, setDragState, cstate } = props;

  let pointData = pstate ? pstate.pointData : []; 
  const cpointData = cstate ? cstate.pointData : [];

  const [canvasRect, setCanvasRect] = useState<number[]>([]);
  const [isShowTip, setIsShowTip] = useState(true);
  // NOTE - 8.1 由文件名可知, 这个是目标盒子 (画布容器)
  /**
   *        a. isOver: 判断被有没有其他的盒子被拖进来
   *        b. drop: 这是一个给 ref赋值的对象
   */
  const [{ isOver }, drop] = useDrop({
    // NOTE - 8.2 关于 accept 的类型: 放过来的类型, 只要相符合, 才能被 drop 盒子响应
    accept: allType,

    // NOTE - 8.3 关于 drop 方法:
    /**
     *  param:  
     *    - item
     *    - minoter: DropTargetMonitor 
     *  return: 返回值会传递给drag组件 end 方法的第一个参数 (显然下面案例中没有返回值)
     */
     
    drop: (item: { h: number; type: string; x: number }, monitor) => {

      // 逗号操作赋, 后面的变量都是 let (代码风格问题, 这种容易出错, 不建议)
      // 作者应该时为了区分两种类型的变量
      let parentDiv = document.getElementById(canvasId), // NOTE - 8.4 注意, 这里要知道canvasId是从哪里来的 --- props 中获取的, 则要看 TargetBox 被嵌套了在哪里
        

        pointRect = parentDiv!.getBoundingClientRect(),  // 这里如果用可选链的话, 后后面依赖这个参数的 top 的值, 就有可能因为 pointRect 为undefined, 而导致 top 也是undefined ; 但是如果用!的话, 就不会有这个问题 (相当于你告诉 ts, 这个类型一定不会为空, 一定是有值的)
        top = pointRect.top,
        pointEnd = monitor.getSourceClientOffset(),
        y = pointEnd!.y < top ? 0 : pointEnd!.y - top,
        col = 24, // 网格列数
        cellHeight = 2,
        w = item.type === 'Icon' ? 3 : col;


      // 转换成网格规则的坐标和大小
      let gridY = Math.ceil(y / cellHeight);

      // NOTE -  8. 显然, 这里操作了config数据上传: localStorage 
      // dva 全局管理了数据
      dispatch({
        type: 'editorModal/addPointData',
        payload: {
          id: uuid(6, 10),
          item,
          point: { i: `x-${pointData.length}`, x: 0, y: gridY, w, h: item.h, isBounded: true },
          status: 'inToCanvas',
        },
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.getItem(),
    }),
  });

  const dragStop: ItemCallback = useMemo(() => {
    return (layout, oldItem, newItem, placeholder, e, element) => {
      const curPointData = pointData.filter(item => item.id === newItem.i)[0];
      dispatch({
        type: 'editorModal/modPointData',
        payload: { ...curPointData, point: newItem, status: 'inToCanvas' },
      });
    };
  }, [cpointData, dispatch, pointData]);

  const onDragStart: ItemCallback = useMemo(() => {
    return (layout, oldItem, newItem, placeholder, e, element) => {
      const curPointData = pointData.filter(item => item.id === newItem.i)[0];
      dispatch({
        type: 'editorModal/modPointData',
        payload: { ...curPointData, status: 'inToCanvas' },
      });
    };
  }, [dispatch, pointData]);

  const onResizeStop: ItemCallback = useMemo(() => {
    return (layout, oldItem, newItem, placeholder, e, element) => {
      const curPointData = pointData.filter(item => item.id === newItem.i)[0];
      dispatch({
        type: 'editorModal/modPointData',
        payload: { ...curPointData, point: newItem, status: 'inToCanvas' },
      });
    };
  }, [dispatch, pointData]);

  const handleContextMenuDel = () => {
    if (pstate.curPoint) {
      dispatch({
        type: 'editorModal/delPointData',
        payload: { id: pstate.curPoint.id },
      });
    }
  };

  const handleContextMenuCopy = () => {
    if (pstate.curPoint) {
      dispatch({
        type: 'editorModal/copyPointData',
        payload: { id: pstate.curPoint.id },
      });
    }
  };

  const onConTextClick = (type: string) => {
    if (type === 'del') {
      handleContextMenuDel();
    } else if (type === 'copy') {
      handleContextMenuCopy();
    }
  };

  const MyAwesomeMenu = useCallback(
    () => (
      <Menu id="menu_id">
        <Item onClick={() => onConTextClick('copy')}>复制</Item>
        <Item onClick={() => onConTextClick('del')}>删除</Item>
      </Menu>
    ),
    [onConTextClick],
  );

  useEffect(() => {
    let { width, height } = document.getElementById(canvasId)!.getBoundingClientRect();
    setCanvasRect([width, height]);
  }, [canvasId]);

  useEffect(() => {
    let timer = window.setTimeout(() => {
      setIsShowTip(false);
    }, 3000);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  const opacity = isOver ? 0.7 : 1;

  const render = useMemo(() => {
    return (
      <Draggable
        position={dragState}
        handle=".js_box"
        onStop={(e: DraggableEvent, data: DraggableData) => {
          setDragState({ x: data.x, y: data.y });
        }}
      >
        <div className={styles.canvasBox}>
          <MenuProvider id="menu_id">
            <div
              style={{
                transform: `scale(${scaleNum})`,
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <div
                id={canvasId}
                className={styles.canvas}
                style={{
                  opacity,
                }}
                ref={drop}
              >
                {pointData.length > 0 ? (
                  <React.Suspense fallback="loading">
                    <ViewRender
                      pointData={pointData}
                      width={canvasRect[0] || 0}
                      dragStop={dragStop}
                      onDragStart={onDragStart}
                      onResizeStop={onResizeStop}
                    />
                  </React.Suspense>
                ) : null}
              </div>
            </div>
          </MenuProvider>
        </div>
      </Draggable>
    );
  }, [
    canvasId,
    canvasRect,
    dragState,
    dragStop,
    drop,
    isShowTip,
    onDragStart,
    onResizeStop,
    opacity,
    pointData,
    scaleNum,
    setDragState,
  ]);

  return (
    <>
      {render}
      <MyAwesomeMenu />
    </>
  );
});

export default connect((state: StateWithHistory<any>) => ({
  pstate: state.present.editorModal,
  cstate: state.present.editorPcModal,
}))(TargetBox);
