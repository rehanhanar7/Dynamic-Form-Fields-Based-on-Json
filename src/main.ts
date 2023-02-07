import 'zone.js/dist/zone';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface FieldConfig {
  name: string;
  type: string;
  validators?: ValidatorFn[];
  options?: string[];
  optionsUrl?: string;
  objectProp?: string;
}

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  template: `
  <form [formGroup]="form" (ngSubmit)="submit()">
  <ng-container *ngFor="let field of fields">
    <div [ngSwitch]="field.type">
      <input *ngSwitchCase="'text'" [type]="field.type" [formControlName]="field.name">
      <textarea *ngSwitchCase="'textarea'" [formControlName]="field.name"></textarea>
      <select *ngSwitchCase="'select'" [formControlName]="field.name">
        <option *ngFor="let option of field.options">{{option}}</option>
      </select>
      <div *ngSwitchCase="'radio'">
        <div *ngFor="let option of field.options">
          <input type="radio" [value]="option" [formControlName]="field.name"> {{option}}
        </div>
      </div>
      <input *ngSwitchCase="'date'" [type]="field.type" [formControlName]="field.name">
    </div>
    <div *ngIf="form.get(field.name).invalid && form.get(field.name).touched">
      <div *ngIf="form.get(field.name).errors.required">{{field.name}} is required</div>
      <div *ngIf="form.get(field.name).errors.pattern">{{field.name}} does not match the pattern</div>
    </div>
  </ng-container>
  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
  `,
})
export class App implements OnInit {
  name = 'Angular';
  form: FormGroup;
  fields: FieldConfig[] = [
    {
      name: 'username',
      type: 'text',
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)],
    },
    {
      name: 'email',
      type: 'text',
      validators: [Validators.required, Validators.email],
    },
    {
      name: 'bio',
      type: 'textarea',
      validators: [Validators.required],
    },
    {
      name: 'gender',
      type: 'radio',
      options: ['Male', 'Female'],
      validators: [Validators.required],
    },
    {
      name: 'dob',
      type: 'date',
      validators: [Validators.required],
    },
    {
      name: 'country',
      type: 'select',
      options: null,
      optionsUrl: 'https://restcountries.com/v3.1/all',
      validators: [Validators.required],
      objectProp: 'name.official',
    },
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.form = this.fb.group({});
    this.fields.forEach((field) => {
      if (field.type === 'select' && field.optionsUrl) {
        // Get the options for this field from the API
        this.http.get(field.optionsUrl).subscribe((options: any[]) => {
          field.options = options.map((item) => {
            const prop = field.objectProp.split('.');
            const value = prop.reduce((obj, key) => {
              return obj ? obj[key] : null;
            }, item);
            return value;
          });
          this.form.addControl(
            field.name,
            this.fb.control({ value: field.options[0], disabled: false }, [
              Validators.required,
            ])
          );
        });
      } else {
        this.form.addControl(
          field.name,
          this.fb.control(null, {
            validators: field.validators,
            updateOn: 'blur',
          })
        );
      }
    });
  }

  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}

bootstrapApplication(App);
