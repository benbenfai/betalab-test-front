import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/share/service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public username!: string;

  constructor(
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
  }

}
