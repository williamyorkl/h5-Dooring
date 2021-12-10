import type { CSSProperties } from 'react';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import ViewRender from '../../renderer/ViewRender';
import domtoimage from 'dom-to-image';
import req from '@/utils/req';
import { getQueryString, useGetScrollBarWidth } from '@/utils/tool';
import type { LocationDescriptorObject } from 'history-with-query';

const isMac = navigator.platform.indexOf('Mac') === 0;

interface PreviewPageProps {
  location: LocationDescriptorObject;
}
interface PointDataItem {
  id: string;
  item: Record<string, unknown>;
  point: Record<string, unknown>;
}

const PreviewPage = memo((props: PreviewPageProps) => {
  // NOTE - 2. 这里操作pointData
  const [pointData, setPointData] = useState(() => {
    const pointDataStr =
      decodeURI(getQueryString('pointData') ?? '') ?? localStorage.getItem('pointData'); // NOTE - 2.2 从两个地方获取，a、url的字符；b、localStorage中

    // NOTE - 2.3 给pointDataStr赋到一个新的变量，不能直接操作pointDataStr
    let points;
    try {
      points = JSON.parse(pointDataStr!) || [];
    } catch (err) {
      points = [];
    }

    // NOTE - 2.4 遍历数组对象，返回一个更新后的对象
    /**
     * 注意：更新后的对象，被更新了这一个属性：point
     *  其中，point里面有：isDraggable:false、isResizable:false
     */
    return points.map((item: PointDataItem) => ({
      ...item,
      point: { ...item.point, isDraggable: false, isResizable: false },
    }));
  });

  // NOTE - 1.2 这里获取到pageData的数据
  const [pageData, setPageData] = useState(() => {
    const pageConfigStr = localStorage.getItem('pageConfig'); // NODE - 1.3 并没有在localstorage找到pageConfig

    let pageConfig;

    try {
      pageConfig = JSON.parse(pageConfigStr!) || {};
    } catch (err) {
      pageConfig = {};
    }
    return pageConfig; // NOTE - 1.4 在useState中，传入一个回调函数，其实是起到初始化数据状态的作用，这时候，外层结构出来的pageData就是 pageConfig，然后setPageData可以改变这个数据
  });
  console.log(
    '🚀 ~ file: index.tsx ~ line 50 ~ const[pageData,setPageData]=useState ~ pageData',
    pageData, // NOTE - 1.5 打印出来后是一个空对象（所以目前还不知道这个有什么用）
  );

  const vw = window.innerWidth;

  useEffect(() => {
    const { tid, gf } = props.location.query!;
    if (!gf && parent.window.location.pathname === '/preview') {
      req
        .get<any, any>('/xxx/xxx/你的自定义接口地址', { params: { tid } })
        .then((res) => {
          const { pageConfig, tpl } = res || { pageConfig: {}, tpl: [] };
          // 设置标题
          document.title = pageConfig.title || 'H5-Dooring | 强大的H5编辑神器';
          // 设置数据源
          setPointData(
            tpl.map((item: { point: Record<string, unknown> }) => ({
              ...item,
              point: { ...item.point, isDraggable: false, isResizable: false },
            })),
          );

          setPageData(pageConfig);
        })
        .catch((err) => {
          console.error(err);
        });
      return;
    }

    setTimeout(() => {
      generateImg((url: string) => {
        (parent as any)?.(window as unknown).getFaceUrl(url);
      });
    }, 3000);
  }, [props.location.query]); // 后面数组有声明对象，说明仅当props.location.query的值发生变化时，useEffect里面的回调才会被执行

  const ref = useRef<HTMLDivElement>(null);
  const refImgDom = useRef<HTMLDivElement>(null);
  const width = useGetScrollBarWidth(ref);
  const pcStyle: CSSProperties = useMemo(() => {
    return {
      width: isMac ? 382 : 375 + width + 1, //小数会有偏差
      margin: '55px auto',
      height: '684px',
      overflow: 'auto',
      position: 'relative',
      transform: 'scale(0.7) translateY(-80px)',
      backgroundColor: pageData.bgColor,
    };
  }, [width]);

  const generateImg = (cb: any) => {
    domtoimage
      .toBlob(refImgDom.current as Node, {
        bgcolor: '#fff',
        //  支持跨域截图
        cacheBust: true,
      })
      .then(function (blob: Blob) {
        const reader = new FileReader();
        reader.onload = function (e) {
          cb(e?.target?.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch(function (error: any) {
        console.error('oops, something went wrong!', error);
      });
  };

  return (
    <>
      <div
        ref={ref}
        style={
          vw > 800
            ? pcStyle
            : { height: '100vh', overflow: 'auto', backgroundColor: pageData.bgColor }
        }
      >
        <div ref={refImgDom}>
          {/* NOTE - 1. 这里传入page的数据，<ViewRender />渲染模块 */}
          <ViewRender pageData={pageData} pointData={pointData} width={vw > 800 ? 375 : vw} />
        </div>
      </div>

      {vw > 800 ? (
        <div
          style={{
            backgroundImage: "url('/iphone.png') ",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            position: 'absolute',
            top: 0,
            height: '840px',
            width: '419px', //375+22+22
            left: '50%',
            transform: 'translate(-50%,-80px) scale(0.7)',
            boxShadow: '0 4px 30px 0 rgba(4, 59, 85, 0.1)',
            borderRadius: '60px',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </>
  );
});

export default PreviewPage;
