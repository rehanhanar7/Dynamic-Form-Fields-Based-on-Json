import 'zone.js/dist/zone';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  FormBuilder,
  FormControl,
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

interface User {
  username: string;
  email: string;
  bio: string;
  gender: string;
  dob: string;
  country: string;
}

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  template: `
  <div class="form-group">
  <label for="usernameSelect">Select User:</label>
  <select class="form-control" id="usernameSelect" [(ngModel)]="selectedUsername" (ngModelChange)="populateForm()">
    <option *ngFor="let user of users" [value]="user.username">{{user.username}}</option>
  </select>
</div>

  <form [formGroup]="form" (ngSubmit)="submit()" class="p-3">
  <ng-container *ngFor="let field of fields">
    <div class="form-group" [ngSwitch]="field.type">
      <label class="font-weight-bold">{{ field.name }}:</label>
      <input *ngSwitchCase="'text'" [type]="field.type" class="form-control col-12 col-sm-6" [formControlName]="field.name">
      <textarea *ngSwitchCase="'textarea'" class="form-control col-12 col-sm-4" [formControlName]="field.name"></textarea>
      <select *ngSwitchCase="'select'" class="form-control col-12 col-sm-6" [formControlName]="field.name">
        <option *ngFor="let option of field.options">{{option}}</option>
      </select>
      <div *ngSwitchCase="'radio'" class="d-flex col-12 col-sm-6">
        <div *ngFor="let option of field.options">
          <input type="radio" [value]="option" [formControlName]="field.name" class="mr-2"> {{option}}
        </div>
      </div>
      <input *ngSwitchCase="'date'" [type]="field.type" class="form-control col-12 col-sm-6" [formControlName]="field.name">
    </div>
    <div class="form-group" *ngIf="form.get(field.name) && form.get(field.name).invalid && form.get(field.name).touched">
      <div *ngIf="form.get(field.name).errors.required">{{field.name}} is required</div>
      <div *ngIf="form.get(field.name).errors.pattern">{{field.name}} does not match the pattern</div>
    </div>
  </ng-container>
  <button type="submit" class="btn btn-primary mt-3" [disabled]="form.invalid">Submit</button>
</form>
  `,
})
export class App implements OnInit {
  name = 'Angular';
  form: FormGroup;
  selectedUsername: string;

  users: User[] = [
    {
      username: '',
      email: '',
      bio: '',
      gender: 'Male',
      dob: '',
      country: '',
    },
    {
      username: 'user1',
      email: 'user1@email.com',
      bio: 'This is my bio',
      gender: 'Male',
      dob: '2000-01-01',
      country: 'New Zealand',
    },
    {
      username: 'user2',
      email: 'user2@email.com',
      bio: 'This is my bio',
      gender: 'Female',
      dob: '2001-02-02',
      country: 'Malaysia',
    },
    {
      username: 'user3',
      email: 'user3@email.com',
      bio: 'This is my bio',
      gender: 'Male',
      dob: '2002-03-03',
      country: 'Guam',
    },
    {
      username: 'user4',
      email: 'user4@email.com',
      bio: 'This is my bio',
      gender: 'Female',
      dob: '2003-04-04',
      country: 'Canada',
    },
    {
      username: 'user5',
      email: 'user5@email.com',
      bio: 'This is my bio',
      gender: 'Male',
      dob: '2004-05-05',
      country: 'Iceland',
    },
  ];

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
      this.form.addControl(field.name, new FormControl('', field.validators));
    });
    this.fields.forEach((field) => {
      if (field.type === 'select' && field.optionsUrl) {
        // Get the options for this field from the API
        this.http.get(field.optionsUrl).subscribe(
          (options: any[]) => {
            field.options = options.map((item) => {
              const prop = field.objectProp.split('.');
              const value = prop.reduce((obj, key) => {
                return obj ? obj[key] : null;
              }, item);
              return value;
            });
          },
          () => {
            this.form.addControl(
              field.name,
              this.fb.control('', [Validators.required])
            );
          }
        );
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

  populateForm() {
    const selectedField = this.users.find(
      (user) => user.username == this.selectedUsername
    );
    this.form.patchValue(selectedField);
    console.log(selectedField);
  }
}

bootstrapApplication(App);
