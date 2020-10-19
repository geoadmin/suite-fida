import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Feature from 'esri/Graphic'

@Component({
  selector: 'app-feature-container',
  templateUrl: './feature-container.component.html',
  styleUrls: ['./feature-container.component.scss']
})
export class FeatureContainerComponent implements OnInit {
  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainer: ViewContainerRef;
  @ViewChild('editContainer', { read: ViewContainerRef }) editContainer: ViewContainerRef;

  @Input() feature: Feature;
  public editMode: boolean = false;

  constructor(private changeDetectorRef:ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  editClick() {
    this.setEditMode(true);
  }

  onSave(feature: Feature) {
    console.log("saved", feature.attributes.OBJECTID);
    this.setEditMode(false);
  }

  onCancle() {
    console.log("cancled")
    this.setEditMode(false);
  }

  private setEditMode(editMode: boolean){
    this.editMode = editMode;
    this.changeDetectorRef.detectChanges();
  }
}
