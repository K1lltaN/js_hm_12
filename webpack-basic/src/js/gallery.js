import { alert } from "@pnotify/core";
import "@pnotify/core/dist/BrightTheme.css";
import "@pnotify/core/dist/PNotify.css";

import "material-icons/iconfont/material-icons.css";

import searchFormTemplate from "../templates/searchForm.handlebars";
import galeryRender from "../templates/galeryRender.handlebars";

import * as basicLightbox from "basiclightbox";
import "basicLightbox/dist/basicLightbox.min.css";

import "../css/style.css";

export { Gallery };

class Gallery {
  constructor(URI) {
    this.URI = URI;
    this.pageCounter = 0;
    this.inputValue = "";
    this.totalPages = null;
    this.array = [];
    this.refs = {
      root: document.querySelector("#root"),
    };

    this.observer = new IntersectionObserver(this.handleImg, {
      root: null,
      rootMargin: "0px",
    });
  }

  // fetchPics = async () => {
  //   let searchQuery = `&q=${this.inputValue}`;
  //   let pageQuery = `&page=${this.pageCounter}`;
  //   let url = this.URI + pageQuery + searchQuery;
  //   try {
  //     let response = await fetch(url);
  //     let data = await response.json();
  //     this.renderPics(data.hits);
  //     this.totalPages = Math.floor(data.totalHits / 12);
  //     this.renderPagination(data);
  //   } catch (err) {
  //     this.renderError(err);
  //   }
  // };

  fetchPics = () => {
    let searchQuery = `&q=${this.inputValue}`;
    let pageQuery = `&page=${this.pageCounter}`;
    let url = this.URI + pageQuery + searchQuery;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        this.renderPics(data.hits);
        this.totalPages = Math.floor(data.totalHits / 12);
        this.renderPagination(data);
      })
      .catch((err) => {
        this.renderError(err);
      });
  };

  renderError = (err) => {
    alert({
      text: `${err}`,
      addClass: "alert",
    });
  };

  renderPics = (picsCollection) => {
    picsCollection.map(({ webformatURL, largeImageURL }) => {
      this.array.push({ webformatURL, largeImageURL });
    });
    let markup = galeryRender(picsCollection);
    this.refs.list.insertAdjacentHTML("beforeend", markup);
  };

  handleImg = (entry) => {
    entry.forEach((mySpan) => {
      if (mySpan.isIntersecting) {
        if (this.pageCounter < this.totalPages) {
          this.pageCounter += 1;
          this.refs.inputPageNumber.value = this.pageCounter;
          this.fetchPics();
        } else {
          alert({
            text: "Не корректный номер страницы",
            addClass: "alert",
          });
        }
      }
    });
  };

  loadImages = () => {
    this.observer.observe(this.refs.span);
  };

  renderPagination = (serverResponse) => {
    this.refs.span.textContent = `of ${Math.floor(
      serverResponse.totalHits / 12
    )}`;
  };

  onPrevBtnClick = () => {
    if (this.pageCounter > 1) {
      this.pageCounter -= 1;
      this.refs.inputPageNumber.value = this.pageCounter;
      this.fetchPics();
    } else {
      alert({
        text: "Не корректный номер страницы",
        addClass: "alert",
      });
    }
  };

  onNextBtnClick = () => {
    if (this.pageCounter < this.totalPages) {
      this.pageCounter += 1;
      this.refs.inputPageNumber.value = this.pageCounter;
      this.fetchPics();
    } else {
      alert({
        text: "Не корректный номер страницы",
        addClass: "alert",
      });
    }
  };

  onInputPageNumber = (event) => {
    if (event.target.value > 0 && event.target.value <= this.totalPages) {
      this.pageCounter = Number(event.target.value);
      this.fetchPics();
    } else {
      alert({
        text: "Не корректный номер страницы",
        addClass: "alert",
      });
    }
  };

  onSearchForm = (event) => {
    event.preventDefault();
    this.inputValue = event.target.elements.query.value;
    this.refs.inputPageNumber.value = 1;
    this.pageCounter = 1;
    this.fetchPics();
    this.refs.list.innerHTML = "";
    this.observer.unobserve(this.refs.span);
  };

  onClear = (event) => {
    event.target.value = "";
    this.pageCounter = 0;
    this.refs.inputPageNumber.value = this.pageCounter;
  };

  showModal = (event) => {
    let largeImg = "";
    if (event.target.nodeName === "IMG") {
      for (let i = 0; i < this.array.length; i += 1) {
        if (event.target.src === this.array[i].webformatURL) {
          largeImg = this.array[i].largeImageURL;
        }
      }
      basicLightbox.create(`<img src= ${largeImg}>`).show();
    }
  };

  loadListeners() {
    window.addEventListener("load", this.fetchPics);
    document.addEventListener("scroll", this.loadImages);
    this.refs.prevBtn.addEventListener("click", this.onPrevBtnClick);
    this.refs.nextBtn.addEventListener("click", this.onNextBtnClick);
    this.refs.inputPageNumber.addEventListener("input", this.onInputPageNumber);
    this.refs.searchForm.addEventListener("submit", this.onSearchForm);
    this.refs.inputPicsSearch.addEventListener("click", this.onClear);
    this.refs.list.addEventListener("click", this.showModal);
  }

  init = () => {
    this.loadListeners();
    this.pageCounter = 1;
    this.refs.inputPageNumber.value = this.pageCounter;
  };

  initForm = () => {
    let markupForm = searchFormTemplate();
    this.refs.root.insertAdjacentHTML("beforeend", markupForm);
    this.refs.list = document.querySelector(".gallery");
    this.refs.prevBtn = document.querySelector("#prev");
    this.refs.nextBtn = document.querySelector("#next");
    this.refs.inputPageNumber = document.querySelector('input[type="number"]');
    this.refs.span = document.querySelector("span");
    this.refs.searchForm = document.querySelector("form");
    this.refs.inputPicsSearch = document.querySelector('input[type="text"]');
    this.init();
  };
}
