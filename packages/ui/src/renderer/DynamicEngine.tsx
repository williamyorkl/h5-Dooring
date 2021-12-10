import { dynamic } from 'umi';
import Loading from '../components/LoadingCp';
import type { FC } from 'react';
import { useMemo, memo } from 'react';
import React from 'react';

export type componentsType = 'media' | 'base' | 'visible';

const DynamicFunc = (type: string, componentsType: string) => {
  return dynamic({
    loader: async function () {
      // NOTE - 5. 动态加载 Graph 这个组件
      const { default: Graph } = await import(`@/ui-component/${componentsType}/${type}`); // NOTE - 5.2 <Graph /> 组件会根据不用的componentsType, type 来渲染组件
      const Component = Graph;

      // NOTE - 5.1 返回一个函数组件,
      /**
       *        - 该函数组件的入参要符合: DynamicType 的形状
       *        - 从入参中, 解构出来 config, isTpl,  传入 <Graph /> 组件
       */
      return (props: DynamicType) => {
        const { config, isTpl } = props;
        return <Component {...config} isTpl={isTpl} />;
      };
    },
    loading: () => (
      <div style={{ paddingTop: 10, textAlign: 'center' }}>
        <Loading />
      </div>
    ),
  });
};

type DynamicType = {
  isTpl: boolean;
  config: Record<string, any>;
  type: string;
  componentsType: componentsType;
  category: string;
};

const DynamicEngine = memo((props: DynamicType) => {
  const { type, config, category } = props; // NOTE - 4. 这三个属性都是从 <ViewRender /> 传过来的 (目前来看是这样的,但是不排除其他可能性)

  const Dynamic = useMemo(() => {
    // NOTE - 5.3 这里传给DynamicFunc接受的type, category,就是对应 5.2中的 type 和 componentsType
    return DynamicFunc(type, category) as unknown as FC<DynamicType>;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]); // NOTE - 4.2 仅当 "config" 变化后,  DynamicFunc() 的结果值才会重新计算 ; DynamicFunc()的结果值一直都是之前的结果

  return <Dynamic {...props} />;
});

export default DynamicEngine;
