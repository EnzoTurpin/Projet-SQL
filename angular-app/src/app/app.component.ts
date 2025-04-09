import { Component, OnInit } from '@angular/core';
import { UserService, User } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((res) => {
      this.users = res.data ?? res; // s’adapte à ton retour Laravel
    });
  }
}
