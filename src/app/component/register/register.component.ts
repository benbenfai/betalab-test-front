import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/share/service/auth.service';
import { Router } from '@angular/router';
import { registerUser } from 'src/app/share/model/user';

class Timer {
  readonly start = performance.now();

  constructor(private readonly name: string) {}

  stop() {
    const time = performance.now() - this.start;
    console.log('Timer:', this.name, 'finished in', Math.round(time), 'ms');
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  private t!: Timer;

  message = '';
  registerForm: FormGroup = this.createForm({
    username: '',
    password: '',
    email: '',
    address: '',
    phone: '',
    picture: '',
    company: '',
  })

  constructor(
    private auth: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  ngDoCheck() {
    this.t = new Timer('register page render');
    console.log(this.t)
  }

  // When change detection has finished:
  // child components created, all *ngIfs evaluated
  ngAfterViewChecked() {
    this.t.stop();  // Prints the time elapsed to the JS console.
  }
  
  createForm(model: registerUser): FormGroup {
    return this.formBuilder.group(model);
  }

  get formValue() {
    return this.registerForm.value as registerUser;
  }

  onSubmit() {

    const username = this.registerForm.value['username'];
    const password = this.registerForm.value['password'];
    const email = this.registerForm.value['email'];
    const address = this.registerForm.value['address'];
    const phone = this.registerForm.value['phone'];
    const picture = this.registerForm.value['picture'];
    const company = this.registerForm.value['company'];
    
    
    this.auth.register(username, password, email, address, phone, picture, company).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.message = error;
      }
    );
  }

}
