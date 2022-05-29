import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/share/service/auth.service';
import { User } from 'src/app/share/model/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  message = '';
  loginForm: FormGroup = this.createForm({
    username: '',
    password: '',
  })

  constructor(
    private auth: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
    ) {}

  ngOnInit(): void {
  }

  createForm(model: User): FormGroup {
    return this.formBuilder.group(model);
  }

  get formValue() {
    return this.loginForm.value as User;
  }

  onSubmit() {

    const username = this.loginForm.value['username'];
    const password = this.loginForm.value['password'];
    
    this.auth.authenticate(username, password).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.message = error;
      }
    );
  }

}
