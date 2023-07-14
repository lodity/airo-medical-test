import React, { useEffect, useState } from "react";
import { IBeerItem, useBearStore } from "./HomePage";
import { useParams } from "react-router";
import axios from "axios";

const BeerPage = () => {
  const linkId = useParams();
  const { beers } = useBearStore();
  const [beer, setBeer] = useState({} as IBeerItem);

  useEffect(() => {
    if (beers.length !== 0) {
      setBeer(
        beers.filter(
          (item) => item.id === (linkId && linkId.id && +linkId.id)
        )[0]
      );
    } else
      axios
        .get<IBeerItem[]>(`https://api.punkapi.com/v2/beers/${linkId.id}`, {})
        .then((res) => {
          setBeer(res.data[0]);
          console.log(beer);
        });
  }, []);

  return (
    <div>
      <h1>
        {beer.id}. {beer.name}
      </h1>
      <p>{beer.tagline}</p>
      <p>{beer.first_brewed}</p>
      <p>{beer.description}</p>
    </div>
  );
};

export default BeerPage;
