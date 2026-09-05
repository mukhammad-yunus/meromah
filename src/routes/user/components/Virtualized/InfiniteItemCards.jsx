import React, {
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import PostCardWithErrorBoundary from "../ErrorBoundary/PostCardWithErrorBoundary";
import { useSelector } from "react-redux";
import Loading from "../../../../components/Loading";
const getKey = (item, layoutKey) => {
  return `${layoutKey}-${item.id}`;
};

/* ---------------- Persistent Height Store ---------------- */
class HeightStore {
  constructor() {
    this.heights = new Map();
    this.listeners = new Set();
    this.notificationScheduled = false;
  }

  get(key) {
    return this.heights.get(key);
  }

  has(key) {
    return this.heights.has(key);
  }

  set(key, value) {
    const changed = this.heights.get(key) !== value;
    this.heights.set(key, value);
    if (changed) {
      this.scheduleNotification();
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  scheduleNotification() {
    if (this.notificationScheduled) return;
    this.notificationScheduled = true;

    requestAnimationFrame(() => {
      this.notificationScheduled = false;
      this.listeners.forEach((cb) => cb());
    });
  }

  clear() {
    this.heights.clear();
    this.scheduleNotification();
  }
}

const heightStores = new Map();
const getHeightStore = (type) => {
  if (!heightStores.has(type)) {
    heightStores.set(type, new HeightStore());
  }
  return heightStores.get(type);
};

/* ---------------- Measurement Component ---------------- */
function ItemMeasurer({ item, onMeasured, heightStore, itemKey }) {
  const ref = useRef(null);
  const measuredRef = useRef(false);

  useLayoutEffect(() => {
    if (!ref.current || measuredRef.current) return;

    const height = ref.current.offsetHeight;

    if (height > 0) {
      heightStore.set(itemKey, height);
      measuredRef.current = true;
      onMeasured(itemKey, height);
    }
  }, [item, onMeasured, heightStore, itemKey]);

  const isBoard = item?.board_id || false;
  const itemType = isBoard ? "post" : "test";
  const communityType = isBoard ? "board" : "desc";
  const communityUrl = isBoard ? "b/" : "d/";

  const handleError = useCallback((message = "Something happened!") => {
    console.error(message);
  }, []);

  return (
    <div ref={ref} className="virtual-item-padding-x">
      <PostCardWithErrorBoundary
        item={item}
        onError={handleError}
        isFirst={false}
        isLast={false}
        itemType={itemType}
        communityType={communityType}
        communityUrl={communityUrl}
        isLiked={false}
      />
    </div>
  );
}

/* ---------------- Stable Resize Observer Hook ---------------- */
function useMeasure(item, onResize, heightStore, itemKey) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const ro = new ResizeObserver(([entry]) => {
      const newHeight = entry.contentRect.height;
      const oldHeight = heightStore.get(itemKey);

      if (newHeight > 0 && oldHeight !== newHeight) {
        heightStore.set(itemKey, newHeight);
        onResize(itemKey, newHeight, oldHeight || 0);
      }
    });

    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [item.id, heightStore, onResize, itemKey]);

  return ref;
}

/* ---------------- Virtual Item ---------------- */
function VirtualItem({
  item,
  index,
  onResize,
  likedData,
  heightStore,
  itemKey,
}) {
  const ref = useMeasure(item, onResize, heightStore, itemKey);

  const isBoard = item?.board_id || false;
  const itemType = isBoard ? "post" : "test";
  const communityType = isBoard ? "board" : "desc";
  const communityUrl = isBoard ? "b/" : "d/";

  const handleError = useCallback((message = "Something happened!") => {
    console.error(message);
  }, []);

  return (
    <div ref={ref} className="virtual-item-padding-x">
      <PostCardWithErrorBoundary
        item={item}
        onError={handleError}
        isFirst={index === 0}
        isLast={false}
        itemType={itemType}
        communityType={communityType}
        communityUrl={communityUrl}
        isLiked={likedData[itemType]?.has(item.id) || false}
      />
    </div>
  );
}

/* ---------------- Feed Window ---------------- */
export default function InfiniteItemCards({
  items,
  headerElements,
  likedData,
  type,
  error = {
    hasError: false,
    status: undefined,
    message: undefined,
  },
  layoutVersion,
  layoutSchemaVersion,
  onNearBottom,
}) {
  const { sidebarMobileHeight } = useSelector((state) => state.ui);

  const INITIAL_MEASURE_COUNT = useMemo(
    () => Math.max(1, Math.min(20, items.length)),
    [items.length]
  );

  const layoutKey = useMemo(
    () => `${type}:${layoutSchemaVersion}`,
    [type, layoutSchemaVersion]
  );

  const containerRef = useRef(null);
  const headerRef = useRef([]);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useLayoutEffect(() => {
    if (!headerRef.current.length) return;

    const ro = new ResizeObserver(() => {
      let total = 0;
      for (const el of headerRef.current) {
        if (el) total += el.offsetHeight;
      }
      setHeaderHeight(total);
    });

    headerRef.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [headerElements]);

  const [range, setRange] = useState({ start: 0, end: INITIAL_MEASURE_COUNT });
  const [heightsVersion, setHeightsVersion] = useState(0);
  const [measuringPhase, setMeasuringPhase] = useState(true);
  const [measuredCount, setMeasuredCount] = useState(0);
  const pendingScrollAdjustmentRef = useRef(0);
  const scrollRafIdRef = useRef(null);

  const OVERSCAN = 5;
  const BOTTOM_THRESHOLD = 1000; // pixels from bottom to trigger fetch
  const heightStore = useMemo(() => getHeightStore(layoutKey), [layoutKey]);

  // Window size tracking with resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate container height based on window size
  const containerHeight = useMemo(() => {
    if (windowSize.width < 768) {
      // Mobile: use calculated pixel height
      const calculatedHeight = windowSize.height - sidebarMobileHeight;
      return calculatedHeight > 0 ? `${calculatedHeight}px` : "100vh";
    }
    // Desktop: use viewport height
    return "100dvh";
  }, [windowSize.width, windowSize.height, sidebarMobileHeight]);

  // Reset measuring phase when items change significantly
  useEffect(() => {
    if (items.length === 0) {
      setMeasuringPhase(false);
      setRange({ start: 0, end: 0 });
      return;
    }

    const needsMeasurement = items
      .slice(0, INITIAL_MEASURE_COUNT)
      .some((item) => !heightStore.has(getKey(item, layoutKey)));

    if (needsMeasurement) {
      setMeasuringPhase(true);
      setMeasuredCount(0);
    } else {
      // If all items are already measured, exit measuring phase immediately
      setMeasuringPhase(false);
      setMeasuredCount(INITIAL_MEASURE_COUNT);
    }
  }, [items.length, layoutKey, heightStore, INITIAL_MEASURE_COUNT]);

  // Subscribe to height changes
  useEffect(() => {
    return heightStore.subscribe(() => {
      setHeightsVersion((v) => v + 1);
      
      // Check if all items are now measured and exit measuring phase if so
      if (measuringPhase && items.length > 0) {
        const allMeasured = items
          .slice(0, INITIAL_MEASURE_COUNT)
          .every((item) => heightStore.has(getKey(item, layoutKey)));
        
        if (allMeasured) {
          setMeasuringPhase(false);
          setMeasuredCount(INITIAL_MEASURE_COUNT);
        }
      }
    });
  }, [heightStore, measuringPhase, items, INITIAL_MEASURE_COUNT, layoutKey]);

  // Handle initial measurements
  const handleItemMeasured = useCallback(() => {
    setMeasuredCount((prev) => {
      const newCount = prev + 1;
      const target = Math.min(INITIAL_MEASURE_COUNT, items.length);
      if (newCount >= target && target > 0) {
        setMeasuringPhase(false);
      }
      return newCount;
    });
  }, [INITIAL_MEASURE_COUNT, items.length]);

  // Compute prefix sums with better height estimation
  const prefixSums = useMemo(() => {
    if (measuringPhase || items.length === 0) return null;

    const sums = new Array(items.length + 1).fill(0);
    const DEFAULT_HEIGHT = 400;
    const WINDOW_SIZE = 10;

    for (let i = 0; i < items.length; i++) {
      const key = getKey(items[i], layoutKey);
      const height = heightStore.get(key);

      if (height !== undefined) {
        sums[i + 1] = sums[i] + height;
      } else {
        // Use moving average of recent measured items
        let recentSum = 0;
        let recentCount = 0;

        for (let j = Math.max(0, i - WINDOW_SIZE); j < i; j++) {
          const recentKey = getKey(items[j], layoutKey);
          const recentHeight = heightStore.get(recentKey);
          if (recentHeight !== undefined) {
            recentSum += recentHeight;
            recentCount++;
          }
        }

        const estimatedHeight =
          recentCount > 0 ? recentSum / recentCount : DEFAULT_HEIGHT;

        sums[i + 1] = sums[i] + estimatedHeight;
      }
    }

    return sums;
  }, [items, measuringPhase, heightsVersion, layoutKey, heightStore]);

  const indexMap = useMemo(() => {
    const map = new Map();
    items.forEach((item, i) => {
      map.set(getKey(item, layoutKey), i);
    });
    return map;
  }, [items, layoutKey]);

  // Binary search for visible range
  const findStartIndex = useCallback(
    (scrollTop) => {
      if (!prefixSums || items.length === 0) return 0;
      let low = 0;
      let high = items.length;

      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (prefixSums[mid + 1] <= scrollTop) {
          low = mid + 1;
        } else if (prefixSums[mid] > scrollTop) {
          high = mid;
        } else {
          return mid;
        }
      }
      return Math.min(low, items.length - 1);
    },
    [prefixSums, items.length]
  );

  const recomputeRange = useCallback(() => {
    if (!containerRef.current || items.length === 0 || !prefixSums) return;

    const scrollTop = Math.max(
      0,
      containerRef.current.scrollTop - headerHeight
    );
    const viewportHeight = containerRef.current.clientHeight;

    const startIdx = findStartIndex(scrollTop);
    const endIdx = findStartIndex(scrollTop + viewportHeight);
    const overscanStart = Math.max(0, startIdx - OVERSCAN);
    const overscanEnd = Math.min(items.length, endIdx + OVERSCAN + 1);

    setRange({ start: overscanStart, end: overscanEnd });
  }, [findStartIndex, items.length, prefixSums, headerHeight]);

  // Batched scroll compensation
  const scheduleScrollAdjustment = useCallback((delta) => {
    pendingScrollAdjustmentRef.current += delta;

    if (!scrollRafIdRef.current) {
      scrollRafIdRef.current = requestAnimationFrame(() => {
        if (containerRef.current && pendingScrollAdjustmentRef.current !== 0) {
          containerRef.current.scrollTop += pendingScrollAdjustmentRef.current;
          pendingScrollAdjustmentRef.current = 0;
        }
        scrollRafIdRef.current = null;
      });
    }
  }, []);

  // Handle resize with proper index lookup
  const handleResize = useCallback(
    (key, newHeight, oldHeight) => {
      const delta = newHeight - oldHeight;

      if (delta !== 0) {
        const itemIndex = indexMap.get(key);

        if (itemIndex !== undefined && itemIndex < range.start) {
          scheduleScrollAdjustment(delta);
        }
      }
    },
    [indexMap, range.start, scheduleScrollAdjustment]
  );

  // Check if near bottom using scroll position
  const checkNearBottom = useCallback(() => {
    if (!containerRef.current || !prefixSums || items.length === 0)
      return false;

    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const clientHeight = containerRef.current.clientHeight;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    return distanceFromBottom < BOTTOM_THRESHOLD;
  }, [prefixSums, items.length]);

  // Stable scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !prefixSums) return;

    const isNearBottom = checkNearBottom();

    if (onNearBottom && isNearBottom && items.length > 0) {
      onNearBottom();
    }

    recomputeRange();
  }, [
    prefixSums,
    checkNearBottom,
    onNearBottom,
    recomputeRange,
    type,
    items.length,
  ]);

  // Throttled scroll with cleanup
  const throttledHandleScroll = useMemo(() => {
    let rafId = null;

    const throttled = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          rafId = null;
        });
      }
    };

    throttled.cancel = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    return throttled;
  }, [handleScroll]);

  // Initial range computation
  useEffect(() => {
    if (!measuringPhase && prefixSums) {
      recomputeRange();
    }
  }, [measuringPhase, prefixSums, recomputeRange]);

  // Layout version reset
  useEffect(() => {
    if (layoutVersion === undefined) return;

    setRange({ start: 0, end: INITIAL_MEASURE_COUNT });
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }

    setMeasuringPhase(true);
    setMeasuredCount(0);
  }, [layoutVersion, INITIAL_MEASURE_COUNT]);

  // Attach scroll listener with cleanup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", throttledHandleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", throttledHandleScroll);
      throttledHandleScroll.cancel();
      if (scrollRafIdRef.current) {
        cancelAnimationFrame(scrollRafIdRef.current);
      }
    };
  }, [throttledHandleScroll]);

  // Render measuring phase
  if (measuringPhase && items.length > 0 && !error.hasError) {
    return (
      <div
        className="flex flex-col gap-4"
        style={{
          overflow: "auto",
          height: containerHeight,
        }}
      >
        {(() => {
          headerRef.current.length = 0;
          return headerElements.map((element, idx) =>
            element((el) => (headerRef.current[idx] = el))
          );
        })()}

        <div
          style={{ visibility: "hidden", position: "absolute", width: "100%" }}
        >
          {items.slice(0, INITIAL_MEASURE_COUNT).map((item) => {
            const isBoard = item?.board_id || false;
            const itemType = isBoard ? "post" : "test";

            return (
              <ItemMeasurer
                key={`${itemType}-${item.id}-${item.title}`}
                itemKey={getKey(item, layoutKey)}
                item={item}
                onMeasured={handleItemMeasured}
                heightStore={heightStore}
              />
            );
          })}
        </div>

        <Loading />
      </div>
    );
  }

  const topSpacerHeight =
    prefixSums && items.length > 0 && range.start < items.length
      ? prefixSums[range.start]
      : 0;

  const bottomSpacerHeight =
    prefixSums && items.length > 0 && range.end <= items.length
      ? prefixSums[items.length] - prefixSums[range.end]
      : 0;
  return (
    <div
      ref={containerRef}
      style={{
        overflow: "auto",
        height: containerHeight,
      }}
      className="flex flex-col gap-4"
    >
      {(() => {
        headerRef.current.length = 0;
        return headerElements.map((element, idx) =>
          element((el) => (headerRef.current[idx] = el))
        );
      })()}

      <div>
        {topSpacerHeight > 0 && (
          <div style={{ height: topSpacerHeight }} aria-hidden="true" />
        )}

        {items.length > 0 &&
          !error.hasError &&
          items.slice(range.start, range.end).map((item, idx) => {
            const globalIndex = range.start + idx;
            const isBoard = item?.board_id || false;
            const itemType = isBoard ? "post" : "test";
            return (
              <VirtualItem
                key={`${itemType}-${item.id}-${item.title}`}
                itemKey={getKey(item, layoutKey)}
                item={item}
                index={globalIndex}
                onResize={handleResize}
                likedData={likedData}
                heightStore={heightStore}
              />
            );
          })}

        {bottomSpacerHeight > 0 && (
          <div style={{ height: bottomSpacerHeight }} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
