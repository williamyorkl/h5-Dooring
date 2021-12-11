const pointData = localStorage.getItem('userPcData') || '[]';

function overSave(name: string, data: any) {
  localStorage.setItem(name, JSON.stringify(data));
}

export default {
  namespace: 'editorPcModal',
  state: {
    pointData: JSON.parse(pointData), // NOTE - 8.3  给pointData设置初始值, 如果用户上面有保存数据的话, 如果没有的话, 一开始为空数组
    curPoint: null,
  },
  reducers: {
    addPointData(state: any, { payload }: any) {
      let pointData = [...state.pointData, payload];
      // QUESTION - 8.1. 这里不难有个疑问, userData 和 pointData 有什么区别
      
      // ANSWER - 8.1 维护两个变量的目的, 是为了用户返回的时候, 可以继续编辑

      // (注意: userData 和 userPcData 是不一样的 ) 
      overSave('userPcData', pointData);
      return {
        ...state,
        pointData,
        curPoint: payload,
      };
    },
    modPointData(state: any, { payload }: any) {
      const { id } = payload;
      const pointData = state.pointData.map((item: any) => {
        if (item.id === id) {
          return payload;
        }
        return { ...item };
      });
      overSave('userPcData', pointData);
      return {
        ...state,
        pointData,
        curPoint: payload,
      };
    },
    delPointData(state: any, { payload }: any) {
      const { id } = payload;
      const pointData = state.pointData.filter((item: any) => item.id !== id);
      overSave('userPcData', pointData);
      return {
        ...state,
        pointData,
        curPoint: null,
      };
    },
    clearAll(state: any) {
      overSave('userPcData', []);
      return {
        ...state,
        pointData: [],
        curPoint: null,
      };
    },
  },
  effects: {},
};
