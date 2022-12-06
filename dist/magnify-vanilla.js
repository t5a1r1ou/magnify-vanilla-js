class Magnify {
    constructor({ originImage, zoomImage = undefined, options = undefined, }) {
        this.originImage = originImage;
        this.zoomImage = zoomImage;
        this.nativeImg = new Image();
        this.nativeImg.src = this.zoomImage
            ? this.zoomImage.src
            : this.originImage.src;
        this.isVisible = false;
        const defaultOptionsPc = {
            width: 200,
            height: 200,
            scale: 2,
        };
        const defaultOptionsSp = {
            width: 100,
            height: 100,
            scale: 2,
        };
        const originImageClass = "originImage";
        const lensId = "BlowupLens";
        if (options?.pc) {
            this.optionsPc = {
                ...defaultOptionsPc,
                ...options.pc,
            };
        }
        else {
            this.optionsPc = defaultOptionsPc;
        }
        if (options?.sp) {
            this.optionsSp = {
                ...defaultOptionsSp,
                ...options.sp,
            };
        }
        else {
            this.optionsSp = defaultOptionsSp;
        }
        this.originImage.addEventListener("dragstart", (e) => e.preventDefault());
        const lens = document.createElement("div");
        lens.id = lensId;
        document.body.appendChild(lens);
        this.blowupLens = document.getElementById(lensId) || undefined;
        if (!this.blowupLens)
            return;
        this.blowupLens.style.backgroundImage = `url(${encodeURI(this.nativeImg.src)})`;
        this.mediaQuery = window.matchMedia("(min-width: 769px)");
        if (!!this.mediaQuery.addEventListener) {
            this.mediaQuery.addEventListener("change", () => this.resize());
        }
        else {
            // iOS 13 Safari　対応
            this.mediaQuery.addListener(() => this.resize());
        }
        const blowupLensDefaultStyle = {
            position: "absolute",
            display: "none",
            pointerEvents: "none",
            zIndex: 999999,
            border: "5px solid #FFF",
            borderRadius: "50%",
            boxShadow: "0 8px 17px 0 rgba(0, 0, 0, 0.2)",
            backgroundRepeat: "no-repeat",
        };
        Object.assign(this.blowupLens.style, blowupLensDefaultStyle);
        this.resize();
        this.originImage.addEventListener("mousemove", this.onMoveDefault.bind(this));
        this.originImage.addEventListener("pointermove", this.onMoveDefault.bind(this));
        this.originImage.addEventListener("touchmove", this.onMoveTouch.bind(this));
        this.originImage.addEventListener("mouseleave", this.onLeave.bind(this));
        this.originImage.classList.add(originImageClass);
        document.addEventListener("touchstart", (e) => {
            const { target } = e;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            if (!target?.closest(`.${originImageClass}`)) {
                this.onLeave();
            }
        });
    }
    resize() {
        const spClass = "__sp";
        if (this.mediaQuery.matches) {
            this.blowupLens.classList.remove(spClass);
        }
        else {
            this.blowupLens.classList.add(spClass);
        }
    }
    getOffset(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
        };
    }
    getComputed(element) {
        if (document.defaultView) {
            return {
                width: parseInt(document.defaultView.getComputedStyle(element, null).width, 10),
                height: parseInt(document.defaultView.getComputedStyle(element, null).height, 10),
            };
        }
        else {
            return {
                width: this.nativeImg.width,
                height: this.nativeImg.height,
            };
        }
    }
    onMoveTouch(event) {
        event.preventDefault();
        this.onMove(event.touches[0].pageX, event.touches[0].pageY);
    }
    onMoveDefault(event) {
        event.preventDefault();
        this.onMove(event.pageX, event.pageY);
    }
    onMove(pageX, pageY) {
        if (!this.isVisible) {
            this.blowupLens.style.display = "block";
            this.isVisible = true;
        }
        const options = this.mediaQuery ? this.optionsPc : this.optionsSp;
        const { width: optionWidth, height: optionHeight, scale: optionScale, } = options;
        const { width: nativeImgWidth, height: nativeImgHeight } = this.nativeImg;
        const { width: imgWidth, height: imgHeight } = this.getComputed(this.originImage);
        const { left: elementOffsetLeft, top: elementOffsetTop } = this.getOffset(this.originImage);
        const lensX = `${pageX - optionWidth / 2}px`;
        const lensY = `${pageY - optionHeight / 2}px`;
        const pX = pageX;
        const pY = pageY;
        const relX = pX - elementOffsetLeft;
        const relY = pY - elementOffsetTop;
        if (relX >= imgWidth || relY >= imgHeight || relX <= 0 || relY <= 0) {
            this.onLeave();
            return;
        }
        // Zoomed image coordinates
        const zoomX = -Math.floor((relX / imgWidth) * (nativeImgWidth * optionScale) - optionWidth / 2);
        const zoomY = -Math.floor((relY / imgHeight) * (nativeImgHeight * optionScale) - optionHeight / 2);
        const backgroundPosition = zoomX + "px " + zoomY + "px";
        const backgroundSize = nativeImgWidth * optionScale +
            "px " +
            nativeImgHeight * optionScale +
            "px";
        // Apply styles to lens
        const blowupStyle = {
            left: lensX,
            top: lensY,
            width: `${optionWidth}px`,
            height: `${optionHeight}px`,
            backgroundPosition,
            backgroundSize,
        };
        if (this.blowupLens) {
            Object.assign(this.blowupLens.style, blowupStyle);
        }
    }
    onLeave() {
        if (this.blowupLens) {
            this.blowupLens.style.display = "none";
        }
        this.isVisible = false;
    }
}
export default Magnify;
//# sourceMappingURL=magnify-vanilla.js.map