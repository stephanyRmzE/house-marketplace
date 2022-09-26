import { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { collection, getDocs, query,  limit } from "firebase/firestore";
import { db } from "../firebase.config";
import Spinner from './Spinner'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Slider() {

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async () => {

        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          limit(5)
        );
        const querySnap = await getDocs(q);

        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) {
    return <Spinner></Spinner>;
  }

  if (listings.length === 0) {
    return <></>
  }

  return (
    listings && (
      <>
        <p className='exploreHeading'>Recommended</p>

        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {listings.map(({ data, id }) => (
            <SwiperSlide key={id} onClick={() => navigate(
              `/category/${data.type}/${id}`)}>
              <div
                style={{
                  backgroundImage: `url(${data.imageUrls[0]})`,
                }}
                className='swiperSlideDiv'
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discountPrice ?? data.regularPrice}{' '}
                  {data.type === 'rent' && '/month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}

export default Slider;
