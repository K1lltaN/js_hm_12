import { Gallery } from "./js/gallery";

const API_KEY = "26060378-15502889436c2cfda383aae0e";
const URI = `https://pixabay.com/api/?image_type=photo&orientation=horizontal&per_page=6&key=${API_KEY}`;

let gallery = new Gallery(URI);
window.onload = gallery.initForm();
