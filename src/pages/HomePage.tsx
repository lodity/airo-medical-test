import axios from "axios";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { useObserver } from "../hooks/useObserver";
import { Link } from "react-router-dom";

export interface IBeerItem {
  id: number;
  name: string;
  tagline: string;
  first_brewed: string;
  description: string;
}
interface BeerState {
  beers: IBeerItem[];
  page: number;
  multipleOfFive: boolean;
  isLoading: boolean;
  canLoadMore: boolean;
  selectedId: number[];
  removeTop: (by: number) => void;
  addPage: (by?: number) => void;
  fetchBeers: (page: number, amount: number) => void;
  fetchBeersByIds: (ids: number[]) => void;
  deleteById: () => void;
}
export const useBearStore = create<BeerState>()((set) => ({
  beers: [],
  page: 4,
  multipleOfFive: true,
  isLoading: false,
  canLoadMore: true,
  selectedId: [],
  removeTop: (by) =>
    set((state) => ({
      beers: state.beers.slice(by, state.beers.length),
      canLoadMore: false,
    })),
  addPage: (by) =>
    set((state) => ({
      page: by ? state.page + by : state.page + 1,
      canLoadMore: true,
    })),
  fetchBeers: async (page, amount) => {
    set((state) => ({
      isLoading: true,
    }));
    await axios
      .get<IBeerItem[]>("https://api.punkapi.com/v2/beers", {
        params: {
          page: page,
          per_page: amount,
        },
      })
      .then((res) => {
        set((state) => ({
          beers: state.beers.concat(res.data),
          isLoading: false,
        }));
      });
  },
  fetchBeersByIds: async (ids) => {
    set((state) => ({
      isLoading: true,
    }));
    await axios
      .get<IBeerItem[]>("https://api.punkapi.com/v2/beers", {
        params: {
          ids: ids.join("|"),
        },
      })
      .then((res) => {
        set((state) => ({
          beers: state.beers.concat(res.data),
          isLoading: false,
        }));
      });
  },
  deleteById: () => {
    set((state) => ({
      beers: state.beers.filter((item) => !state.selectedId.includes(item.id)),
      selectedId: [],
    }));
  },
}));
const HomePage = () => {
  const {
    fetchBeers,
    beers,
    removeTop,
    addPage,
    isLoading,
    canLoadMore,
    page,
    selectedId,
    deleteById,
    fetchBeersByIds,
    multipleOfFive,
  } = useBearStore();
  useEffect(() => {
    fetchBeers(1, 15);
  }, []);
  const lastElement = useRef<HTMLDivElement>(null);

  useObserver(lastElement, canLoadMore, isLoading, () => {
    if (beers.length !== 0) {
      console.log(1);
      removeTop(5);
      if (multipleOfFive) {
        fetchBeers(page, 5);
        addPage();
      } else {
        addBeersByIds();
      }
      if (beers.length < 15) {
        addPage(-page + 1);
      }
    }
  });
  function addBeersByIds() {
    let ids = [];
    for (
      let i = beers[beers.length - 1].id + 1;
      i <
      beers[beers.length - 1].id +
        1 +
        (selectedId.length !== 0 ? selectedId.length : 5);
      i++
    ) {
      ids.push(i);
    }
    fetchBeersByIds(ids);
    useBearStore.setState((state) => ({
      canLoadMore: true,
    }));
  }

  return (
    <>
      <div className="container flex flex-col gap-1 items-center m-auto max-w-3xl">
        {selectedId.length !== 0 && (
          <button
            onClick={() => {
              useBearStore.setState((state) => ({
                multipleOfFive: selectedId.length % 5 === 0,
              }));
              addPage(
                selectedId.length < 5
                  ? undefined
                  : Math.floor(selectedId.length / 5)
              );
              addBeersByIds();
              console.log(page);
              deleteById();
              console.log(beers);
            }}
            className="bg-red-500 rounded px-2 py-1"
          >
            DELETE
          </button>
        )}
        {beers.map((beer) => (
          <Link
            to={`/${beer.id}`}
            onContextMenu={(e) => {
              e.preventDefault();
              !selectedId.includes(beer.id)
                ? useBearStore.setState((state) => ({
                    selectedId: state.selectedId.concat(beer.id),
                  }))
                : useBearStore.setState((state) => ({
                    selectedId: state.selectedId.filter((id) => id !== beer.id),
                  }));
            }}
            key={beer.id}
            className={`flex flex-col gap-1 w-full min-h-1/5-screen border-2 ${
              selectedId.includes(beer.id) && "border-red-500"
            }`}
          >
            <h2 className="text-2xl font-bold">
              {beer.id}. {beer.name}
            </h2>
            <p>{beer.description}</p>
          </Link>
        ))}
        <div ref={lastElement} className="h-1 w-full"></div>
      </div>
    </>
  );
};

export default HomePage;
