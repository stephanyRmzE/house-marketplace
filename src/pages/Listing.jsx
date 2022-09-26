import { useState, useEffect} from "react";
import { toast } from "react-toastify";
import { Link,useNavigate, useParams } from "react-router-dom";
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { getAuth} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathtubIcon from "../assets/svg/bathtubIcon.svg";
import parkingIcon from "../assets/svg/parkingIcon.svg";
import furnitureIcon from "../assets/svg/furnitureIcon.svg";
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Listing() {

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setshareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Get reference
        const docRef = doc(db,'listings', params.listingId)

        // Get Snapshot
        const docSnap = await getDoc(docRef);

        if (docSnap.exists) {
          setListing(docSnap.data());
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error("Could not fetch listing");
      }
    };
    fetchListing();

  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner></Spinner>
  }

  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {listing.imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                backgroundImage: `url(${listing.imageUrls[index]})`,
                }}
              className='swiperSlideDiv'
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setshareLinkCopied(true);

          setTimeout(() => {
            setshareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt='' />
      </div>

      {shareLinkCopied && <p className='linkCopied'>Link copied!</p>}

      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name} - $
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>
          For {listing.type === "rent" ? "rent" : "sale"}
        </p>
        {listing.offer && (
          <p className='discountPrice'>
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        <ul className='listingDetailsList'>
          <li>
            <div className='ListingInfoDiv'>
              <img src={bedIcon} alt='beds' />
              <p className='ListingInfoText'>
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} Bedrooms`
                  : " 1 Bedroom"}
              </p>
            </div>
          </li>
          <li>
            <div className='ListingInfoDiv'>
              <img src={bathtubIcon} alt='Bathrooms' />
              <p className='ListingInfoText'>
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Bathrooms`
                  : " 1 Bathroom"}
              </p>
            </div>
          </li>

          <li>
            <div className='ListingInfoDiv'>
              <img src={parkingIcon} alt='Parking' />
              <p className='ListingInfoText'>
                {listing.parking ? "Parking spot" : "No parking Spot"}
              </p>
            </div>
          </li>

          <li>
            <div className='ListingInfoDiv'>
              <img src={furnitureIcon} alt='Parking' />
              <p className='ListingInfoText'>
                {listing.furnished ? "Furnished" : "No Furnished"}
              </p>
            </div>
          </li>
        </ul>

        <p className='listingLocationTitle'>Location</p>
        <div className='leafletContainer'>
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={15}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;
