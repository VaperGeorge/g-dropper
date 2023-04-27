import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-media-capture',
  templateUrl: './media-capture.component.html',
  styleUrls: ['./media-capture.component.scss'],
})
export class MediaCaptureComponent implements OnInit, OnDestroy {
  imageCapture!: ImageCapture;
  track!: MediaStreamTrack;
  @ViewChild('video', { static: true }) video!: ElementRef;
  @ViewChild('img') img!: ElementRef;
  @ViewChild('grabFrameCanvas') canvas!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      console.log(mediaStream);
      this.track = mediaStream.getVideoTracks()[0];
      console.log(this.track);
      const capabilities = this.track.getCapabilities();
      console.log(capabilities);
      this.imageCapture = new ImageCapture(this.track);
      console.log(this.imageCapture);
      this.video.nativeElement.srcObject = mediaStream;
    });
  }

  grabFrame() {
    this.imageCapture
      .grabFrame()
      .then((imageBitmap) => {
        this.#drawCanvas(this.canvas.nativeElement, imageBitmap);
      })
      .catch((error) => console.log(error));
  }

  takePhoto() {
    this.imageCapture
      .takePhoto()
      .then((blob) => {
        this.img.nativeElement.src = URL.createObjectURL(blob);
      })
      .catch((error) => console.log(error));
  }

  ngOnDestroy(): void {
    this.track.stop();
  }

  #drawCanvas(canvas: HTMLCanvasElement, img: ImageBitmap) {
    canvas.width = +getComputedStyle(canvas).width.split('px')[0];
    canvas.height = +getComputedStyle(canvas).height.split('px')[0];
    let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
    let x = (canvas.width - img.width * ratio) / 2;
    let y = (canvas.height - img.height * ratio) / 2;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    canvas
      .getContext('2d')!
      .drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        x,
        y,
        img.width * ratio,
        img.height * ratio
      );
  }
}
